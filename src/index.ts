/**
 * Host Cordis plugin for `codexhost-plugin-scoped-access`.
 *
 * Registers a `WebAccessPolicyProvider` with CodexHost's `codexhostAccess` service
 * and mounts primary-only management endpoints under `/codexhost-scoped-access`.
 */
import type { IncomingMessage, ServerResponse } from "node:http";

import { ScopedKeyStore } from "./store.ts";
import type {
  HostAccessService,
  HostWebServerService,
  ScopedAccessStateResponse,
  ScopedKeyInput,
} from "./types.ts";

export const name = "codexhost-plugin-scoped-access";
export const inject = ["webServer", "codexhostAccess"] as const;

const ROUTE_PREFIX = "/codexhost-scoped-access";
const MAX_BODY_BYTES = 128 * 1024;

interface PluginContext {
  readonly webServer: HostWebServerService;
  readonly codexhostAccess: HostAccessService;
  effect(callback: () => void | (() => void), label?: string): void;
}

function writeJson(res: ServerResponse, status: number, body: unknown): void {
  res
    .writeHead(status, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    })
    .end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    const part = Buffer.from(chunk as Uint8Array);
    bytes += part.length;
    if (bytes > MAX_BODY_BYTES) throw new Error("Request body is too large.");
    chunks.push(part);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Request body must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

export function apply(ctx: PluginContext): void {
  const access = ctx.codexhostAccess;
  const store = new ScopedKeyStore(access.dataDirectory);

  ctx.effect(
    () =>
      access.registerProvider({
        id: name,
        resolveToken: (candidate) => store.resolveToken(candidate),
        getPolicy: (credentialId) => store.getPolicy(credentialId),
        hasCredential: (credentialId) => store.hasCredential(credentialId),
        listCredentialIds: () => store.listCredentialIds(),
      }),
    `${name}: access policy provider`,
  );

  const buildState = async (): Promise<ScopedAccessStateResponse> => {
    const [projects, modelGroups, networkUrls] = await Promise.all([
      access.listProjects(),
      access.listModels(),
      access.getNetworkUrls().catch(() => []),
    ]);
    return {
      keys: store.list(),
      projects,
      modelGroups,
      networkUrls,
      configFile: store.keysPath,
    };
  };

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: "prefix",
        path: ROUTE_PREFIX,
        async handler(req, res) {
          if (!access.authEnabled) {
            writeJson(res, 409, {
              error: {
                code: "auth/disabled",
                message: "Authentication must be enabled to manage scoped access keys.",
              },
            });
            return;
          }
          const reqAuth = access.getRequestAuth(req);
          if (!reqAuth || reqAuth.scope !== "full") {
            writeJson(res, 403, {
              error: {
                code: "auth/forbidden",
                message: "Primary access is required to manage scoped access keys.",
              },
            });
            return;
          }

          const url = new URL(req.url ?? ROUTE_PREFIX, "http://localhost");
          const subpath = url.pathname.slice(ROUTE_PREFIX.length) || "/";
          const method = (req.method ?? "GET").toUpperCase();

          try {
            if (method === "GET" && (subpath === "/state" || subpath === "/")) {
              writeJson(res, 200, await buildState());
              return;
            }

            if (method === "POST" && subpath === "/keys") {
              const body = await readJsonBody(req);
              const key = store.create(body as unknown as ScopedKeyInput);
              writeJson(res, 201, { key, state: await buildState() });
              return;
            }

            const rotateMatch = /^\/keys\/([^/]+)\/rotate$/u.exec(subpath);
            if (method === "POST" && rotateMatch?.[1]) {
              const id = decodeURIComponent(rotateMatch[1]);
              const key = store.rotate(id);
              access.revokeCredential(key.credentialId);
              writeJson(res, 200, { key, state: await buildState() });
              return;
            }

            const keyMatch = /^\/keys\/([^/]+)$/u.exec(subpath);
            if (keyMatch?.[1]) {
              const id = decodeURIComponent(keyMatch[1]);
              if (method === "PUT" || method === "PATCH") {
                const body = await readJsonBody(req);
                const key = store.update(id, body as Partial<ScopedKeyInput>);
                // Drop existing WebSockets so connected clients immediately adopt updated permissions
                // (or lose access when disabled).
                access.revokeCredential(key.credentialId);
                writeJson(res, 200, { key, state: await buildState() });
                return;
              }
              if (method === "DELETE") {
                const { credentialId } = store.remove(id);
                access.revokeCredential(credentialId);
                writeJson(res, 200, { deleted: true, state: await buildState() });
                return;
              }
            }

            writeJson(res, 404, { error: { code: "not-found", message: "Route not found." } });
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const status = message.includes("not found") ? 404 : 400;
            writeJson(res, status, { error: { code: "scoped-access/invalid", message } });
          }
        },
      }),
    `${name}: management routes`,
  );
}
