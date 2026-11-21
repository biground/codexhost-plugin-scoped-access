/**
 * Persistent JSON store for scoped Web access keys.
 *
 * Keys live in `<web-data>/scoped-access/keys.json` (0600) and usage timestamps in a
 * sibling `usage.json` so usage recording can never overwrite key edits.
 */
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

import type {
  AllowedModelSpec,
  HostWebAccessPolicy,
  ScopedKeyInput,
  ScopedKeyRecord,
  ScopedKeyView,
} from "./types.ts";

const DIR_NAME = "scoped-access";
const KEYS_FILE = "keys.json";
const USAGE_FILE = "usage.json";
const SECRET_PREFIX = "chsk_";
const CREDENTIAL_PREFIX = "scoped:web-scoped-access:";
const SECRET_MODE = 0o600;
const DIR_MODE = 0o700;
const MAX_KEYS = 64;
const MAX_PROJECTS_PER_KEY = 128;
const MAX_MODELS_PER_KEY = 256;
const USAGE_WRITE_INTERVAL_MS = 60_000;

interface StoredFile {
  version: 1;
  keys: ScopedKeyRecord[];
}

interface CompiledKey {
  record: ScopedKeyRecord;
  credentialId: string;
  digest: Buffer;
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function credentialIdForKey(id: string): string {
  return `${CREDENTIAL_PREFIX}${id}`;
}

function sanitizePaths(paths: readonly string[]): string[] {
  if (!Array.isArray(paths)) throw new Error("allowedProjectPaths must be an array.");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of paths) {
    if (typeof item !== "string") throw new Error("Project path must be a string.");
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (/[\u0000-\u001f\u007f]/u.test(trimmed))
      throw new Error("Project path contains invalid control characters.");
    const nativePath =
      process.platform === "win32" ? trimmed.replace(/^\/(?=[A-Za-z]:[/\\])/u, "") : trimmed;
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

function sanitizeModels(models: readonly AllowedModelSpec[]): AllowedModelSpec[] {
  if (!Array.isArray(models)) throw new Error("allowedModels must be an array.");
  const seen = new Set<string>();
  const out: AllowedModelSpec[] = [];
  for (const item of models) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.provider !== "string" ||
      typeof item.model !== "string"
    )
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

function sanitizeName(name: unknown): string {
  if (typeof name !== "string") throw new Error("Key name is required.");
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Key name cannot be empty.");
  if (trimmed.length > 80) throw new Error("Key name must be at most 80 characters.");
  return trimmed;
}

function isRecord(value: unknown): value is ScopedKeyRecord {
  const entry = value as Partial<ScopedKeyRecord> | null;
  return (
    entry !== null &&
    typeof entry === "object" &&
    typeof entry.id === "string" &&
    entry.id.length > 0 &&
    typeof entry.name === "string" &&
    typeof entry.secret === "string" &&
    entry.secret.length >= 16 &&
    typeof entry.enabled === "boolean" &&
    Array.isArray(entry.allowedProjectPaths) &&
    entry.allowedProjectPaths.every((item) => typeof item === "string") &&
    Array.isArray(entry.allowedModels) &&
    entry.allowedModels.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof (item as AllowedModelSpec).provider === "string" &&
        typeof (item as AllowedModelSpec).model === "string",
    ) &&
    typeof entry.allowWorkspaceFiles === "boolean" &&
    typeof entry.allowTerminal === "boolean" &&
    typeof entry.createdAt === "string" &&
    typeof entry.updatedAt === "string"
  );
}

function atomicWriteJson(filePath: string, value: unknown): void {
  const dir = join(filePath, "..");
  mkdirSync(dir, { recursive: true, mode: DIR_MODE });
  const temp = `${filePath}.${randomBytes(6).toString("hex")}.tmp`;
  try {
    writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: SECRET_MODE });
    renameSync(temp, filePath);
    try {
      chmodSync(filePath, SECRET_MODE);
    } catch {
      // Windows does not implement POSIX chmod modes identically.
    }
  } finally {
    if (existsSync(temp)) rmSync(temp, { force: true });
  }
}

export class ScopedKeyStore {
  readonly directory: string;
  readonly keysPath: string;
  private readonly usagePath: string;
  private compiled: CompiledKey[] = [];
  private signature: string | undefined;
  private readonly lastUsageWrite = new Map<string, number>();

  constructor(dataDirectory: string) {
    this.directory = join(dataDirectory, DIR_NAME);
    this.keysPath = join(this.directory, KEYS_FILE);
    this.usagePath = join(this.directory, USAGE_FILE);
    this.load();
  }

  private fileSignature(): string | undefined {
    try {
      const { ino, mtimeMs, size } = statSync(this.keysPath);
      return `${String(ino)}:${String(mtimeMs)}:${String(size)}`;
    } catch {
      return undefined;
    }
  }

  private sync(): void {
    if (this.fileSignature() === this.signature) return;
    this.load();
  }

  private load(): void {
    this.signature = this.fileSignature();
    if (!existsSync(this.keysPath)) {
      this.compiled = [];
      return;
    }
    try {
      const raw = JSON.parse(readFileSync(this.keysPath, "utf8")) as Partial<StoredFile>;
      if (raw?.version !== 1 || !Array.isArray(raw.keys)) {
        this.compiled = [];
        return;
      }
      this.compiled = raw.keys.filter(isRecord).map((record) => ({
        record,
        credentialId: credentialIdForKey(record.id),
        digest: sha256(record.secret),
      }));
    } catch (error) {
      console.error("[scoped-access] failed to read keys.json", error);
      this.compiled = [];
    }
  }

  private save(records: ScopedKeyRecord[]): void {
    atomicWriteJson(this.keysPath, { version: 1, keys: records } satisfies StoredFile);
    this.load();
  }

  private readUsage(): Record<string, number> {
    if (!existsSync(this.usagePath)) return {};
    try {
      const parsed = JSON.parse(readFileSync(this.usagePath, "utf8")) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      const out: Record<string, number> = {};
      for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
      }
      return out;
    } catch {
      return {};
    }
  }

  private recordUse(id: string): void {
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

  private toPolicy(entry: CompiledKey): HostWebAccessPolicy {
    return {
      credentialId: entry.credentialId,
      label: entry.record.name,
      allowedProjectPaths: entry.record.allowedProjectPaths,
      allowedModels: entry.record.allowedModels,
      allowWorkspaceFiles: entry.record.allowWorkspaceFiles,
      allowTerminal: entry.record.allowTerminal,
    };
  }

  list(): ScopedKeyView[] {
    this.sync();
    const usage = this.readUsage();
    return this.compiled.map((entry) => ({
      ...entry.record,
      credentialId: entry.credentialId,
      lastUsedAt: usage[entry.record.id] ?? null,
    }));
  }

  listCredentialIds(): string[] {
    this.sync();
    return this.compiled.map((entry) => entry.credentialId);
  }

  resolveToken(
    candidate: string,
  ): { readonly credentialId: string; readonly policy: HostWebAccessPolicy } | undefined {
    this.sync();
    if (!candidate || this.compiled.length === 0) return undefined;
    const candidateDigest = sha256(candidate);
    let matched: CompiledKey | undefined;
    for (const entry of this.compiled) {
      if (timingSafeEqual(candidateDigest, entry.digest)) {
        matched = entry;
      }
    }
    if (!matched || !matched.record.enabled) return undefined;
    this.recordUse(matched.record.id);
    return { credentialId: matched.credentialId, policy: this.toPolicy(matched) };
  }

  getPolicy(credentialId: string): HostWebAccessPolicy | undefined {
    this.sync();
    const entry = this.compiled.find((item) => item.credentialId === credentialId);
    if (!entry || !entry.record.enabled) return undefined;
    return this.toPolicy(entry);
  }

  hasCredential(credentialId: string): boolean {
    this.sync();
    return this.compiled.some(
      (item) => item.credentialId === credentialId && item.record.enabled,
    );
  }

  create(input: ScopedKeyInput): ScopedKeyView {
    this.sync();
    if (this.compiled.length >= MAX_KEYS) {
      throw new Error(`At most ${MAX_KEYS} scoped access keys can be created.`);
    }
    const now = new Date().toISOString();
    const record: ScopedKeyRecord = {
      id: randomUUID(),
      name: sanitizeName(input.name),
      secret: `${SECRET_PREFIX}${randomBytes(28).toString("base64url")}`,
      enabled: input.enabled !== false,
      allowedProjectPaths: sanitizePaths(input.allowedProjectPaths),
      allowedModels: sanitizeModels(input.allowedModels),
      allowWorkspaceFiles: input.allowWorkspaceFiles !== false,
      allowTerminal: input.allowTerminal === true,
      createdAt: now,
      updatedAt: now,
    };
    this.save([...this.compiled.map((item) => item.record), record]);
    return {
      ...record,
      credentialId: credentialIdForKey(record.id),
      lastUsedAt: null,
    };
  }

  update(id: string, patch: Partial<ScopedKeyInput>): ScopedKeyView {
    this.sync();
    const existing = this.compiled.find((item) => item.record.id === id);
    if (!existing) throw new Error("Scoped access key not found.");
    const updated: ScopedKeyRecord = {
      ...existing.record,
      name: patch.name !== undefined ? sanitizeName(patch.name) : existing.record.name,
      enabled: patch.enabled !== undefined ? Boolean(patch.enabled) : existing.record.enabled,
      allowedProjectPaths:
        patch.allowedProjectPaths !== undefined
          ? sanitizePaths(patch.allowedProjectPaths)
          : existing.record.allowedProjectPaths,
      allowedModels:
        patch.allowedModels !== undefined
          ? sanitizeModels(patch.allowedModels)
          : existing.record.allowedModels,
      allowWorkspaceFiles:
        patch.allowWorkspaceFiles !== undefined
          ? Boolean(patch.allowWorkspaceFiles)
          : existing.record.allowWorkspaceFiles,
      allowTerminal:
        patch.allowTerminal !== undefined
          ? Boolean(patch.allowTerminal)
          : existing.record.allowTerminal,
      updatedAt: new Date().toISOString(),
    };
    this.save(this.compiled.map((item) => (item.record.id === id ? updated : item.record)));
    const usage = this.readUsage();
    return {
      ...updated,
      credentialId: credentialIdForKey(updated.id),
      lastUsedAt: usage[updated.id] ?? null,
    };
  }

  rotate(id: string): ScopedKeyView {
    this.sync();
    const existing = this.compiled.find((item) => item.record.id === id);
    if (!existing) throw new Error("Scoped access key not found.");
    const rotated: ScopedKeyRecord = {
      ...existing.record,
      secret: `${SECRET_PREFIX}${randomBytes(28).toString("base64url")}`,
      updatedAt: new Date().toISOString(),
    };
    this.save(this.compiled.map((item) => (item.record.id === id ? rotated : item.record)));
    const usage = this.readUsage();
    return {
      ...rotated,
      credentialId: credentialIdForKey(rotated.id),
      lastUsedAt: usage[rotated.id] ?? null,
    };
  }

  remove(id: string): { credentialId: string } {
    this.sync();
    const existing = this.compiled.find((item) => item.record.id === id);
    if (!existing) throw new Error("Scoped access key not found.");
    this.save(this.compiled.filter((item) => item.record.id !== id).map((item) => item.record));
    return { credentialId: existing.credentialId };
  }
}
