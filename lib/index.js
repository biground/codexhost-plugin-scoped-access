// plugins/web-scoped-access/src/store.ts
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
var DIR_NAME = "scoped-access";
var KEYS_FILE = "keys.json";
var USAGE_FILE = "usage.json";
var SECRET_PREFIX = "chsk_";
var CREDENTIAL_PREFIX = "scoped:web-scoped-access:";
var SECRET_MODE = 384;
var DIR_MODE = 448;
var MAX_KEYS = 64;
var MAX_PROJECTS_PER_KEY = 128;
var MAX_MODELS_PER_KEY = 256;
var USAGE_WRITE_INTERVAL_MS = 6e4;
function sha256(value) {
  return createHash("sha256").update(value).digest();
}
function credentialIdForKey(id) {
  return `${CREDENTIAL_PREFIX}${id}`;
}
function sanitizePaths(paths) {
  if (!Array.isArray(paths)) throw new Error("allowedProjectPaths must be an array.");
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const item of paths) {
    if (typeof item !== "string") throw new Error("Project path must be a string.");
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (/[\u0000-\u001f\u007f]/u.test(trimmed))
      throw new Error("Project path contains invalid control characters.");
    const nativePath = process.platform === "win32" ? trimmed.replace(/^\/(?=[A-Za-z]:[/\\])/u, "") : trimmed;
    if (!isAbsolute(nativePath))
      throw new Error(`Project path must be an absolute path: ${trimmed}`);
    const normalized = resolve(nativePath);
    const dedupeKey = process.platform === "win32" ? normalized.toLowerCase() : normalized;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push(normalized);
    if (out.length > MAX_PROJECTS_PER_KEY)
      throw new Error(`At most ${MAX_PROJECTS_PER_KEY} project paths per key.`);
  }
  return out;
}
function sanitizeModels(models) {
  if (!Array.isArray(models)) throw new Error("allowedModels must be an array.");
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const item of models) {
    if (!item || typeof item !== "object" || typeof item.provider !== "string" || typeof item.model !== "string")
      throw new Error("Each allowed model must specify provider and model.");
    const provider = item.provider.trim();
    const model = item.model.trim();
    if (!provider || !model) throw new Error("Model provider and id must be non-empty.");
    const key = `${provider}\0${model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ provider, model });
    if (out.length > MAX_MODELS_PER_KEY)
      throw new Error(`At most ${MAX_MODELS_PER_KEY} models per key.`);
  }
  return out;
}
function sanitizeName(name2) {
  if (typeof name2 !== "string") throw new Error("Key name is required.");
  const trimmed = name2.trim();
  if (!trimmed) throw new Error("Key name cannot be empty.");
  if (trimmed.length > 80) throw new Error("Key name must be at most 80 characters.");
  return trimmed;
}
function isRecord(value) {
  const entry = value;
  return entry !== null && typeof entry === "object" && typeof entry.id === "string" && entry.id.length > 0 && typeof entry.name === "string" && typeof entry.secret === "string" && entry.secret.length >= 16 && typeof entry.enabled === "boolean" && Array.isArray(entry.allowedProjectPaths) && entry.allowedProjectPaths.every((item) => typeof item === "string") && Array.isArray(entry.allowedModels) && entry.allowedModels.every(
    (item) => item !== null && typeof item === "object" && typeof item.provider === "string" && typeof item.model === "string"
  ) && typeof entry.allowWorkspaceFiles === "boolean" && typeof entry.allowTerminal === "boolean" && typeof entry.createdAt === "string" && typeof entry.updatedAt === "string";
}
function atomicWriteJson(filePath, value) {
  const dir = join(filePath, "..");
  mkdirSync(dir, { recursive: true, mode: DIR_MODE });
  const temp = `${filePath}.${randomBytes(6).toString("hex")}.tmp`;
  try {
    writeFileSync(temp, `${JSON.stringify(value, null, 2)}
`, { mode: SECRET_MODE });
    renameSync(temp, filePath);
    try {
      chmodSync(filePath, SECRET_MODE);
    } catch {
    }
  } finally {
    if (existsSync(temp)) rmSync(temp, { force: true });
  }
}
var ScopedKeyStore = class {
  directory;
  keysPath;
  usagePath;
  compiled = [];
  signature;
  lastUsageWrite = /* @__PURE__ */ new Map();
  constructor(dataDirectory) {
    this.directory = join(dataDirectory, DIR_NAME);
    this.keysPath = join(this.directory, KEYS_FILE);
    this.usagePath = join(this.directory, USAGE_FILE);
    this.load();
  }
  fileSignature() {
    try {
      const { ino, mtimeMs, size } = statSync(this.keysPath);
      return `${String(ino)}:${String(mtimeMs)}:${String(size)}`;
    } catch {
      return void 0;
    }
  }
  sync() {
    if (this.fileSignature() === this.signature) return;
    this.load();
  }
  load() {
    this.signature = this.fileSignature();
    if (!existsSync(this.keysPath)) {
      this.compiled = [];
      return;
    }
    try {
      const raw = JSON.parse(readFileSync(this.keysPath, "utf8"));
      if (raw?.version !== 1 || !Array.isArray(raw.keys)) {
        this.compiled = [];
        return;
      }
      this.compiled = raw.keys.filter(isRecord).map((record) => ({
        record,
        credentialId: credentialIdForKey(record.id),
        digest: sha256(record.secret)
      }));
    } catch (error) {
      console.error("[scoped-access] failed to read keys.json", error);
      this.compiled = [];
    }
  }
  save(records) {
    atomicWriteJson(this.keysPath, { version: 1, keys: records });
    this.load();
  }
  readUsage() {
    if (!existsSync(this.usagePath)) return {};
    try {
      const parsed = JSON.parse(readFileSync(this.usagePath, "utf8"));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      const out = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
      }
      return out;
    } catch {
      return {};
    }
  }
  recordUse(id) {
    const now = Date.now();
    const last = this.lastUsageWrite.get(id) ?? 0;
    if (now - last < USAGE_WRITE_INTERVAL_MS) return;
    this.lastUsageWrite.set(id, now);
    try {
      const usage = this.readUsage();
      usage[id] = now;
      atomicWriteJson(this.usagePath, usage);
    } catch (error) {
      console.error("[scoped-access] could not record key usage", error);
    }
  }
  toPolicy(entry) {
    return {
      credentialId: entry.credentialId,
      label: entry.record.name,
      allowedProjectPaths: entry.record.allowedProjectPaths,
      allowedModels: entry.record.allowedModels,
      allowWorkspaceFiles: entry.record.allowWorkspaceFiles,
      allowTerminal: entry.record.allowTerminal
    };
  }
  list() {
    this.sync();
    const usage = this.readUsage();
    return this.compiled.map((entry) => ({
      ...entry.record,
      credentialId: entry.credentialId,
      lastUsedAt: usage[entry.record.id] ?? null
    }));
  }
  listCredentialIds() {
    this.sync();
    return this.compiled.map((entry) => entry.credentialId);
  }
  resolveToken(candidate) {
    this.sync();
    if (!candidate || this.compiled.length === 0) return void 0;
    const candidateDigest = sha256(candidate);
    let matched;
    for (const entry of this.compiled) {
      if (timingSafeEqual(candidateDigest, entry.digest)) {
        matched = entry;
      }
    }
    if (!matched || !matched.record.enabled) return void 0;
    this.recordUse(matched.record.id);
    return { credentialId: matched.credentialId, policy: this.toPolicy(matched) };
  }
  getPolicy(credentialId) {
    this.sync();
    const entry = this.compiled.find((item) => item.credentialId === credentialId);
    if (!entry || !entry.record.enabled) return void 0;
    return this.toPolicy(entry);
  }
  hasCredential(credentialId) {
    this.sync();
    return this.compiled.some(
      (item) => item.credentialId === credentialId && item.record.enabled
    );
  }
  create(input) {
    this.sync();
    if (this.compiled.length >= MAX_KEYS) {
      throw new Error(`At most ${MAX_KEYS} scoped access keys can be created.`);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const record = {
      id: randomUUID(),
      name: sanitizeName(input.name),
      secret: `${SECRET_PREFIX}${randomBytes(28).toString("base64url")}`,
      enabled: input.enabled !== false,
      allowedProjectPaths: sanitizePaths(input.allowedProjectPaths),
      allowedModels: sanitizeModels(input.allowedModels),
      allowWorkspaceFiles: input.allowWorkspaceFiles !== false,
      allowTerminal: input.allowTerminal === true,
      createdAt: now,
      updatedAt: now
    };
    this.save([...this.compiled.map((item) => item.record), record]);
    return {
      ...record,
      credentialId: credentialIdForKey(record.id),
      lastUsedAt: null
    };
  }
  update(id, patch) {
    this.sync();
    const existing = this.compiled.find((item) => item.record.id === id);
    if (!existing) throw new Error("Scoped access key not found.");
    const updated = {
      ...existing.record,
      name: patch.name !== void 0 ? sanitizeName(patch.name) : existing.record.name,
      enabled: patch.enabled !== void 0 ? Boolean(patch.enabled) : existing.record.enabled,
      allowedProjectPaths: patch.allowedProjectPaths !== void 0 ? sanitizePaths(patch.allowedProjectPaths) : existing.record.allowedProjectPaths,
      allowedModels: patch.allowedModels !== void 0 ? sanitizeModels(patch.allowedModels) : existing.record.allowedModels,
      allowWorkspaceFiles: patch.allowWorkspaceFiles !== void 0 ? Boolean(patch.allowWorkspaceFiles) : existing.record.allowWorkspaceFiles,
      allowTerminal: patch.allowTerminal !== void 0 ? Boolean(patch.allowTerminal) : existing.record.allowTerminal,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.save(this.compiled.map((item) => item.record.id === id ? updated : item.record));
    const usage = this.readUsage();
    return {
      ...updated,
      credentialId: credentialIdForKey(updated.id),
      lastUsedAt: usage[updated.id] ?? null
    };
  }
  rotate(id) {
    this.sync();
    const existing = this.compiled.find((item) => item.record.id === id);
    if (!existing) throw new Error("Scoped access key not found.");
    const rotated = {
      ...existing.record,
      secret: `${SECRET_PREFIX}${randomBytes(28).toString("base64url")}`,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.save(this.compiled.map((item) => item.record.id === id ? rotated : item.record));
    const usage = this.readUsage();
    return {
      ...rotated,
      credentialId: credentialIdForKey(rotated.id),
      lastUsedAt: usage[rotated.id] ?? null
    };
  }
  remove(id) {
    this.sync();
    const existing = this.compiled.find((item) => item.record.id === id);
    if (!existing) throw new Error("Scoped access key not found.");
    this.save(this.compiled.filter((item) => item.record.id !== id).map((item) => item.record));
    return { credentialId: existing.credentialId };
  }
};

// plugins/web-scoped-access/src/index.ts
var name = "codexhost-plugin-scoped-access";
var inject = ["webServer", "codexhostAccess"];
var ROUTE_PREFIX = "/codexhost-scoped-access";
var MAX_BODY_BYTES = 128 * 1024;
function writeJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  }).end(JSON.stringify(body));
}
async function readJsonBody(req) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    const part = Buffer.from(chunk);
    bytes += part.length;
    if (bytes > MAX_BODY_BYTES) throw new Error("Request body is too large.");
    chunks.push(part);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Request body must be a JSON object.");
  }
  return parsed;
}
function apply(ctx) {
  const access = ctx.codexhostAccess;
  const store = new ScopedKeyStore(access.dataDirectory);
  ctx.effect(
    () => access.registerProvider({
      id: name,
      resolveToken: (candidate) => store.resolveToken(candidate),
      getPolicy: (credentialId) => store.getPolicy(credentialId),
      hasCredential: (credentialId) => store.hasCredential(credentialId),
      listCredentialIds: () => store.listCredentialIds()
    }),
    `${name}: access policy provider`
  );
  const buildState = async () => {
    const [projects, modelGroups, networkUrls] = await Promise.all([
      access.listProjects(),
      access.listModels(),
      access.getNetworkUrls().catch(() => [])
    ]);
    return {
      keys: store.list(),
      projects,
      modelGroups,
      networkUrls,
      configFile: store.keysPath
    };
  };
  ctx.effect(
    () => ctx.webServer.register({
      kind: "prefix",
      path: ROUTE_PREFIX,
      async handler(req, res) {
        if (!access.authEnabled) {
          writeJson(res, 409, {
            error: {
              code: "auth/disabled",
              message: "Authentication must be enabled to manage scoped access keys."
            }
          });
          return;
        }
        const reqAuth = access.getRequestAuth(req);
        if (!reqAuth || reqAuth.scope !== "full") {
          writeJson(res, 403, {
            error: {
              code: "auth/forbidden",
              message: "Primary access is required to manage scoped access keys."
            }
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
            const key = store.create(body);
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
              const key = store.update(id, body);
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
      }
    }),
    `${name}: management routes`
  );
}
export {
  apply,
  inject,
  name
};
