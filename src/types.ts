import type { IncomingMessage, ServerResponse } from "node:http";

export interface AllowedModelSpec {
  readonly provider: string;
  readonly model: string;
}

export interface ScopedKeyRecord {
  readonly id: string;
  readonly name: string;
  readonly secret: string;
  readonly enabled: boolean;
  readonly allowedProjectPaths: readonly string[];
  readonly allowedModels: readonly AllowedModelSpec[];
  readonly allowWorkspaceFiles: boolean;
  readonly allowTerminal: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ScopedKeyView extends ScopedKeyRecord {
  readonly credentialId: string;
  readonly lastUsedAt: number | null;
}

export interface ProjectOption {
  readonly workspaceId?: string;
  readonly title: string;
  readonly path: string;
}

export interface ModelOption {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly fastModel?: string;
  readonly ultrafastModel?: string;
}

export interface ModelGroupOption {
  readonly id: string;
  readonly name: string;
  readonly models: readonly ModelOption[];
}

export interface NetworkUrlOption {
  readonly kind: string;
  readonly url: string;
}

export interface ScopedAccessStateResponse {
  readonly keys: readonly ScopedKeyView[];
  readonly projects: readonly ProjectOption[];
  readonly modelGroups: readonly ModelGroupOption[];
  readonly networkUrls: readonly NetworkUrlOption[];
  readonly configFile: string;
}

export interface ScopedKeyInput {
  readonly name: string;
  readonly enabled?: boolean;
  readonly allowedProjectPaths: readonly string[];
  readonly allowedModels: readonly AllowedModelSpec[];
  readonly allowWorkspaceFiles?: boolean;
  readonly allowTerminal?: boolean;
}

/** Host Cordis services consumed by the Node entry of this plugin. */
export interface HostWebRoute {
  readonly kind: "exact" | "prefix";
  readonly path: string;
  handler(req: IncomingMessage, res: ServerResponse): void | Promise<void>;
}

export interface HostWebServerService {
  register(route: HostWebRoute): () => void;
}

export interface HostWebAccessPolicy {
  readonly credentialId: string;
  readonly label?: string;
  readonly allowedProjectPaths: readonly string[];
  readonly allowedModels: readonly AllowedModelSpec[];
  readonly allowWorkspaceFiles: boolean;
  readonly allowTerminal: boolean;
}

export interface HostAccessService {
  readonly authEnabled: boolean;
  readonly dataDirectory: string;
  registerProvider(provider: {
    readonly id: string;
    resolveToken(
      candidate: string,
    ): { readonly credentialId: string; readonly policy: HostWebAccessPolicy } | undefined;
    getPolicy(credentialId: string): HostWebAccessPolicy | undefined;
    hasCredential(credentialId: string): boolean;
    listCredentialIds(): readonly string[];
  }): () => void;
  revokeCredential(credentialId: string): void;
  getRequestAuth(
    request: IncomingMessage,
  ): { readonly credential: string; readonly local: boolean; readonly scope: "full" | "scoped" } | undefined;
  listProjects(): Promise<readonly ProjectOption[]>;
  listModels(): Promise<readonly ModelGroupOption[]>;
  getNetworkUrls(): Promise<readonly NetworkUrlOption[]>;
}
