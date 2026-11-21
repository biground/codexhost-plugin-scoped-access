/**
 * Browser client entry for `codexhost-plugin-scoped-access`.
 *
 * Mounts a primary-only Settings section ("次级访问权限" / "Scoped access") for creating
 * and managing scoped remote access keys restricted to selected projects and models.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Button, Modal, Switch } from "@deepseek-ai/dsh-client-ui-primitives";
import { encode } from "uqr";

import type {
  AllowedModelSpec,
  ModelGroupOption,
  NetworkUrlOption,
  ScopedAccessStateResponse,
  ScopedKeyInput,
  ScopedKeyView,
} from "../types.ts";

export const name = "codexhost-plugin-scoped-access";
export const inject = ["slots", "locale"] as const;

const NS = "codexhostScopedAccess";
const ROUTE_BASE = "/codexhost-scoped-access";
const STYLE_ID = "codexhost-plugin-scoped-access-styles";

const EN = {
  "section.title": "Scoped access",
  "page.title": "Scoped remote access keys",
  "page.subtitle":
    "Issue secondary remote access keys limited to chosen projects and specific models. Scoped keys cannot access unauthorized projects, models, terminal, extensions, or device management.",
  "page.create": "New scoped key",
  "page.refresh": "Refresh",
  "page.loading": "Loading scoped access keys…",
  "page.authDisabled": "Authentication must be enabled to manage scoped access keys.",
  "page.forbidden": "Only the primary key or local computer can manage scoped access keys.",
  "page.empty": "No scoped access keys yet. Create one to grant limited project and model access.",
  "page.configPath": "Config file: {path}",
  "key.enabled": "Active",
  "key.disabled": "Disabled",
  "key.summary": "{projects} project(s) · {models} model(s)",
  "key.filesOn": "Files: Allowed",
  "key.filesOff": "Files: Off",
  "key.terminalOn": "Terminal: Allowed",
  "key.terminalOff": "Terminal: Off",
  "key.neverUsed": "Never used",
  "key.lastUsed": "Last used {time}",
  "key.connect": "Connect / QR",
  "key.edit": "Edit",
  "key.rotate": "Rotate",
  "key.delete": "Delete",
  "editor.createTitle": "Create scoped access key",
  "editor.editTitle": "Edit scoped access key",
  "editor.nameLabel": "Key name",
  "editor.namePlaceholder": "e.g. Frontend review phone / Guest",
  "editor.projectsTitle": "Permitted projects",
  "editor.projectsHint":
    "This key can only list, open, create, and read files inside the selected project directories.",
  "editor.projectsEmpty": "No local projects discovered yet. Add an absolute directory path below.",
  "editor.customPathPlaceholder": "Add absolute project directory path…",
  "editor.addPath": "Add path",
  "editor.modelsTitle": "Permitted models",
  "editor.modelsHint":
    "This key can only see and run the exact models selected below.",
  "editor.modelsEmpty": "No ready Harnesses or models detected right now.",
  "editor.selectAll": "Select all",
  "editor.clearAll": "Clear",
  "editor.capabilitiesTitle": "Additional capabilities",
  "editor.allowFiles": "Allow browsing and downloading files within permitted projects",
  "editor.allowTerminal":
    "Allow right-sidebar terminal (caution: host shell can reach paths outside the project)",
  "editor.save": "Save",
  "editor.create": "Create key",
  "editor.cancel": "Cancel",
  "editor.close": "Close",
  "editor.validationName": "Enter a name for this key.",
  "editor.validationProjects": "Select or add at least one project directory.",
  "editor.validationModels": "Select at least one permitted model.",
  "connect.title": "Connect with scoped key",
  "connect.description":
    "Scan the QR code or open the link on another device. It signs in only with this key's restricted permissions.",
  "connect.address": "Access address",
  "connect.revealQr": "Click to reveal QR code",
  "connect.hideQr": "Hide QR code",
  "connect.qrWarning": "Contains a scoped access key. Share only with intended devices.",
  "connect.copyLink": "Copy login link",
  "connect.copyKey": "Copy key",
  "connect.copied": "Copied",
  "connect.copyFailed": "Copy failed",
  "confirm.rotateTitle": "Regenerate this scoped key?",
  "confirm.rotateBody":
    "Devices using the old key will be disconnected immediately and must sign in with the new key.",
  "confirm.rotateAction": "Regenerate",
  "confirm.deleteTitle": "Delete this scoped key?",
  "confirm.deleteBody":
    "Devices signed in with \"{name}\" will lose access immediately. Existing conversations are not deleted.",
  "confirm.deleteAction": "Delete",
} as const;

const ZH: Record<keyof typeof EN, string> = {
  "section.title": "次级访问权限",
  "page.title": "次级远程访问密钥",
  "page.subtitle":
    "为不同设备或协作者签发受限密钥：仅能访问授权项目目录，且只能使用指定的模型；自动禁用未授权项目、终端、界面扩展及全局设备管理。",
  "page.create": "新建次级密钥",
  "page.refresh": "刷新",
  "page.loading": "正在加载次级访问密钥…",
  "page.authDisabled": "未启用访问认证时无法管理次级访问密钥。",
  "page.forbidden": "仅本机或主访问密钥可以管理次级访问密钥。",
  "page.empty": "还没有次级访问密钥。点击右上角新建一个，按项目和模型分配独立权限。",
  "page.configPath": "配置文件：{path}",
  "key.enabled": "已启用",
  "key.disabled": "已停用",
  "key.summary": "{projects} 个项目 · {models} 个模型",
  "key.filesOn": "项目文件：允许",
  "key.filesOff": "项目文件：禁止",
  "key.terminalOn": "终端：允许",
  "key.terminalOff": "终端：禁止",
  "key.neverUsed": "尚未登录使用",
  "key.lastUsed": "最近使用：{time}",
  "key.connect": "扫码 / 链接",
  "key.edit": "编辑权限",
  "key.rotate": "重置密钥",
  "key.delete": "删除",
  "editor.createTitle": "新建次级访问密钥",
  "editor.editTitle": "编辑次级访问密钥",
  "editor.nameLabel": "密钥名称",
  "editor.namePlaceholder": "例如：测试手机 / 仅前端项目",
  "editor.projectsTitle": "允许访问的项目",
  "editor.projectsHint": "持有该密钥的远程连接只能看到并操作下方勾选的项目及其会话与文件。",
  "editor.projectsEmpty": "暂未发现本地项目，可在下方手动添加项目绝对路径。",
  "editor.customPathPlaceholder": "输入项目目录绝对路径，例如 D:\\WorkSpace\\my-app 或 /Users/me/app",
  "editor.addPath": "添加路径",
  "editor.modelsTitle": "允许使用的模型",
  "editor.modelsHint": "持有该密钥的远程连接只能看到并调用下方勾选的模型。",
  "editor.modelsEmpty": "当前没有检测到就绪的 Harness 或模型目录。",
  "editor.selectAll": "全选",
  "editor.clearAll": "清空",
  "editor.capabilitiesTitle": "附加权限",
  "editor.allowFiles": "允许查看、预览和下载授权项目内的文件（右侧栏文件树与附件）",
  "editor.allowTerminal": "允许打开右侧栏终端（谨慎：终端具备宿主机 Shell 权限，可越出项目目录）",
  "editor.save": "保存修改",
  "editor.create": "创建密钥",
  "editor.cancel": "取消",
  "editor.close": "关闭",
  "editor.validationName": "请填写密钥名称。",
  "editor.validationProjects": "请至少勾选或添加一个允许访问的项目目录。",
  "editor.validationModels": "请至少勾选一个允许使用的模型。",
  "connect.title": "使用次级密钥连接",
  "connect.description": "用手机扫码或复制登录链接打开，将仅以该密钥的受限权限登录。",
  "connect.address": "访问地址",
  "connect.revealQr": "点击查看二维码",
  "connect.hideQr": "隐藏二维码",
  "connect.qrWarning": "包含次级访问密钥，请仅分享给授权设备。",
  "connect.copyLink": "复制登录链接",
  "connect.copyKey": "复制密钥",
  "connect.copied": "已复制",
  "connect.copyFailed": "复制失败",
  "confirm.rotateTitle": "重新生成该次级密钥？",
  "confirm.rotateBody": "正在使用旧密钥的设备会立即断开，需要重新扫码或输入新密钥。",
  "confirm.rotateAction": "重新生成",
  "confirm.deleteTitle": "删除该次级密钥？",
  "confirm.deleteBody": "使用“{name}”登录的设备会立即失效，不会删除已有对话记录。",
  "confirm.deleteAction": "删除",
};

type LocaleKey = keyof typeof EN;
type Translate = (key: LocaleKey, params?: Record<string, string | number>) => string;

const CSS = `
.csa-page { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.csa-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.csa-title { margin: 0 0 6px; color: var(--dsw-alias-label-primary, inherit); font-size: 20px; line-height: 28px; font-weight: 600; }
.csa-subtitle { margin: 0; color: var(--dsw-alias-label-secondary, #6b7280); font-size: 13px; line-height: 20px; max-width: 640px; }
.csa-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.csa-error { margin: 0; padding: 10px 12px; border-radius: 8px; font-size: 13px; color: #ef4444; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); }
.csa-notice { margin: 0; padding: 12px 14px; border-radius: 10px; font-size: 13px; color: var(--dsw-alias-label-secondary, #6b7280); border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.22)); background: var(--dsw-alias-bg-layer-2, transparent); }
.csa-list { display: flex; flex-direction: column; gap: 12px; }
.csa-card { display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: 12px; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.22)); background: var(--dsw-alias-bg-layer-2, transparent); }
.csa-card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.csa-card-name { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary, inherit); }
.csa-badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 500; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.25)); color: var(--dsw-alias-label-secondary, #6b7280); }
.csa-badge[data-active="true"] { color: #16a34a; border-color: rgba(22, 163, 74, 0.35); background: rgba(22, 163, 74, 0.08); }
.csa-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.csa-pill { font-size: 12px; padding: 2px 8px; border-radius: 6px; background: rgba(128, 128, 128, 0.1); color: var(--dsw-alias-label-secondary, #6b7280); }
.csa-path-list { display: flex; flex-direction: column; gap: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--dsw-alias-label-secondary, #6b7280); overflow-wrap: anywhere; }
.csa-meta { margin: 0; font-size: 12px; color: var(--dsw-alias-label-tertiary, #9ca3af); overflow-wrap: anywhere; }
.csa-form { display: flex; flex-direction: column; gap: 16px; max-height: 68vh; overflow-y: auto; padding-right: 4px; }
.csa-field { display: flex; flex-direction: column; gap: 6px; }
.csa-label { font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-primary, inherit); }
.csa-input, .csa-select { width: 100%; box-sizing: border-box; padding: 8px 10px; border-radius: 8px; font-size: 13px; color: var(--dsw-alias-label-primary, inherit); background: var(--dsw-alias-bg-layer-1, transparent); border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.3)); }
.csa-row { display: flex; gap: 8px; align-items: center; }
.csa-checklist { display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto; padding: 8px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.22)); }
.csa-check { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; cursor: pointer; color: var(--dsw-alias-label-primary, inherit); }
.csa-check input { margin-top: 3px; flex: none; }
.csa-check-sub { display: block; font-size: 11px; color: var(--dsw-alias-label-tertiary, #9ca3af); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; }
.csa-group { display: flex; flex-direction: column; gap: 6px; padding: 10px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.22)); }
.csa-group-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-primary, inherit); }
.csa-link-btn { background: none; border: none; padding: 0; font-size: 12px; color: #3b82f6; cursor: pointer; }
.csa-link-btn:hover { text-decoration: underline; }
.csa-chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.csa-chip { display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: rgba(59, 130, 246, 0.1); color: var(--dsw-alias-label-primary, inherit); }
.csa-chip button { border: none; background: transparent; color: inherit; cursor: pointer; padding: 0 2px; font-size: 13px; }
.csa-qr-box { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 16px; border-radius: 12px; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.22)); }
.csa-qr-wrap { position: relative; width: 196px; height: 196px; border-radius: 10px; overflow: hidden; cursor: pointer; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.25)); }
.csa-qr-svg { width: 100%; height: 100%; display: block; transition: filter 0.15s ease; }
.csa-qr-svg[data-blurred="true"] { filter: blur(8px); }
.csa-qr-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.35); color: #fff; font-size: 13px; font-weight: 600; text-align: center; padding: 12px; }
.csa-code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; padding: 8px 10px; border-radius: 8px; background: rgba(128, 128, 128, 0.1); word-break: break-all; color: var(--dsw-alias-label-primary, inherit); }
`;

interface ApiErrorPayload {
  error?: { code?: string; message?: string };
}

class ScopedAccessError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${ROUTE_BASE}${path}`, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.body !== undefined ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload & T;
  if (!response.ok) {
    throw new ScopedAccessError(
      payload.error?.message ?? `HTTP ${String(response.status)}`,
      payload.error?.code ?? `http/${String(response.status)}`,
    );
  }
  return payload;
}

async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard !== undefined) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      if (typeof window !== "undefined" && window.isSecureContext) throw error;
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  try {
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    if (!document.execCommand("copy")) throw new Error("Copy failed");
  } finally {
    textarea.remove();
  }
}

function modelKey(provider: string, model: string): string {
  return `${provider}\0${model}`;
}

interface SelectableModelEntry {
  readonly provider: string;
  readonly model: string;
  readonly label: string;
}

function flattenGroupModels(group: ModelGroupOption): SelectableModelEntry[] {
  const seen = new Set<string>();
  const out: SelectableModelEntry[] = [];
  const push = (model: string, label: string) => {
    if (seen.has(model)) return;
    seen.add(model);
    out.push({ provider: group.id, model, label });
  };
  for (const item of group.models) {
    push(item.id, item.description ? `${item.name} (${item.description})` : item.name);
    if (item.fastModel) push(item.fastModel, `${item.name} · Fast`);
    if (item.ultrafastModel) push(item.ultrafastModel, `${item.name} · Ultrafast`);
  }
  return out;
}

function QrSvg({ value, blurred }: { value: string; blurred: boolean }): ReactNode {
  const { size, path } = useMemo(() => {
    const code = encode(value, { ecc: "M", border: 2 });
    let modules = "";
    code.data.forEach((row, y) => {
      row.forEach((dark, x) => {
        if (dark) modules += `M${String(x)} ${String(y)}h1v1h-1z`;
      });
    });
    return { size: code.size, path: modules };
  }, [value]);
  return (
    <svg
      role="img"
      aria-label="QR"
      className="csa-qr-svg"
      data-blurred={blurred}
      viewBox={`0 0 ${String(size)} ${String(size)}`}
      shapeRendering="crispEdges"
    >
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}

function ConnectModal({
  item,
  networkUrls,
  onClose,
  t,
}: {
  item: ScopedKeyView;
  networkUrls: readonly NetworkUrlOption[];
  onClose: () => void;
  t: Translate;
}): ReactNode {
  const options = useMemo(() => {
    const urls = networkUrls.map((entry) => ({
      label: `${entry.kind.toUpperCase()} · ${entry.url}`,
      url: entry.url.replace(/\/+$/u, ""),
    }));
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin.replace(/\/+$/u, "") : "";
    if (currentOrigin && !urls.some((entry) => entry.url === currentOrigin)) {
      urls.push({ label: currentOrigin, url: currentOrigin });
    }
    return urls;
  }, [networkUrls]);

  const [selectedUrl, setSelectedUrl] = useState(options[0]?.url ?? "");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState<"link" | "key" | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const loginUrl = `${selectedUrl || window.location.origin}/#token=${encodeURIComponent(item.secret)}`;

  const copy = (kind: "link" | "key", value: string) => {
    setCopyError(null);
    void copyToClipboard(value).then(
      () => {
        setCopied(kind);
        setTimeout(() => setCopied((prev) => (prev === kind ? null : prev)), 2000);
      },
      () => setCopyError(t("connect.copyFailed")),
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`${t("connect.title")} · ${item.name}`}
      closeLabel={t("editor.close")}
      description={t("connect.description")}
      footer={
        <Button variant="outline" onClick={onClose}>
          {t("editor.close")}
        </Button>
      }
    >
      <div className="csa-form">
        {options.length > 0 && (
          <div className="csa-field">
            <label className="csa-label">{t("connect.address")}</label>
            <select
              className="csa-select"
              value={selectedUrl}
              onChange={(event) => setSelectedUrl(event.target.value)}
            >
              {options.map((option) => (
                <option key={option.url} value={option.url}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="csa-qr-box">
          <div
            className="csa-qr-wrap"
            role="button"
            tabIndex={0}
            onClick={() => setRevealed((prev) => !prev)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setRevealed((prev) => !prev);
              }
            }}
          >
            <QrSvg value={loginUrl} blurred={!revealed} />
            {!revealed && <div className="csa-qr-overlay">{t("connect.revealQr")}</div>}
          </div>
          <p className="csa-meta">{t("connect.qrWarning")}</p>
          <div className="csa-actions">
            <Button variant="outline" onClick={() => setRevealed((prev) => !prev)}>
              {t(revealed ? "connect.hideQr" : "connect.revealQr")}
            </Button>
            <Button variant="primary" onClick={() => copy("link", loginUrl)}>
              {t(copied === "link" ? "connect.copied" : "connect.copyLink")}
            </Button>
            <Button variant="outline" onClick={() => copy("key", item.secret)}>
              {t(copied === "key" ? "connect.copied" : "connect.copyKey")}
            </Button>
          </div>
        </div>
        {revealed && <div className="csa-code">{item.secret}</div>}
        {copyError && <p className="csa-error">{copyError}</p>}
      </div>
    </Modal>
  );
}

function KeyEditorModal({
  initial,
  state,
  busy,
  onClose,
  onSubmit,
  t,
}: {
  initial?: ScopedKeyView;
  state: ScopedAccessStateResponse;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: ScopedKeyInput) => Promise<void>;
  t: Translate;
}): ReactNode {
  const [keyName, setKeyName] = useState(initial?.name ?? "");
  const [selectedPaths, setSelectedPaths] = useState<string[]>(() => [
    ...(initial?.allowedProjectPaths ?? []),
  ]);
  const [customPath, setCustomPath] = useState("");
  const [selectedModels, setSelectedModels] = useState<AllowedModelSpec[]>(() => [
    ...(initial?.allowedModels ?? []),
  ]);
  const [allowWorkspaceFiles, setAllowWorkspaceFiles] = useState(
    initial?.allowWorkspaceFiles ?? true,
  );
  const [allowTerminal, setAllowTerminal] = useState(initial?.allowTerminal ?? false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const knownPathSet = useMemo(
    () => new Set(state.projects.map((project) => project.path)),
    [state.projects],
  );
  const customPaths = useMemo(
    () => selectedPaths.filter((path) => !knownPathSet.has(path)),
    [knownPathSet, selectedPaths],
  );
  const modelKeySet = useMemo(
    () => new Set(selectedModels.map((entry) => modelKey(entry.provider, entry.model))),
    [selectedModels],
  );

  const togglePath = (path: string) => {
    setSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path],
    );
  };

  const addCustomPath = () => {
    const trimmed = customPath.trim();
    if (!trimmed) return;
    if (!selectedPaths.includes(trimmed)) setSelectedPaths((prev) => [...prev, trimmed]);
    setCustomPath("");
  };

  const toggleModel = (provider: string, model: string) => {
    const key = modelKey(provider, model);
    setSelectedModels((prev) =>
      prev.some((entry) => modelKey(entry.provider, entry.model) === key)
        ? prev.filter((entry) => modelKey(entry.provider, entry.model) !== key)
        : [...prev, { provider, model }],
    );
  };

  const setGroupModels = (group: ModelGroupOption, checked: boolean) => {
    const entries = flattenGroupModels(group);
    const keys = new Set(entries.map((entry) => modelKey(entry.provider, entry.model)));
    setSelectedModels((prev) => {
      const rest = prev.filter((entry) => !keys.has(modelKey(entry.provider, entry.model)));
      return checked
        ? [...rest, ...entries.map((entry) => ({ provider: entry.provider, model: entry.model }))]
        : rest;
    });
  };

  const handleSave = async () => {
    if (!keyName.trim()) {
      setValidationError(t("editor.validationName"));
      return;
    }
    if (selectedPaths.length === 0) {
      setValidationError(t("editor.validationProjects"));
      return;
    }
    if (selectedModels.length === 0) {
      setValidationError(t("editor.validationModels"));
      return;
    }
    setValidationError(null);
    try {
      await onSubmit({
        name: keyName.trim(),
        allowedProjectPaths: selectedPaths,
        allowedModels: selectedModels,
        allowWorkspaceFiles,
        allowTerminal,
      });
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Modal
      open
      onClose={() => {
        if (!busy) onClose();
      }}
      title={t(initial ? "editor.editTitle" : "editor.createTitle")}
      closeLabel={t("editor.close")}
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            {t("editor.cancel")}
          </Button>
          <Button variant="primary" disabled={busy} onClick={() => void handleSave()}>
            {t(initial ? "editor.save" : "editor.create")}
          </Button>
        </>
      }
    >
      <div className="csa-form">
        <div className="csa-field">
          <label className="csa-label">{t("editor.nameLabel")}</label>
          <input
            className="csa-input"
            type="text"
            value={keyName}
            maxLength={80}
            placeholder={t("editor.namePlaceholder")}
            onChange={(event) => setKeyName(event.target.value)}
          />
        </div>

        <div className="csa-field">
          <span className="csa-label">{t("editor.projectsTitle")}</span>
          <span className="csa-meta">{t("editor.projectsHint")}</span>
          {state.projects.length === 0 ? (
            <p className="csa-meta">{t("editor.projectsEmpty")}</p>
          ) : (
            <div className="csa-checklist">
              {state.projects.map((project) => (
                <label key={project.path} className="csa-check">
                  <input
                    type="checkbox"
                    checked={selectedPaths.includes(project.path)}
                    onChange={() => togglePath(project.path)}
                  />
                  <span>
                    {project.title}
                    <span className="csa-check-sub">{project.path}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="csa-row">
            <input
              className="csa-input"
              type="text"
              value={customPath}
              placeholder={t("editor.customPathPlaceholder")}
              onChange={(event) => setCustomPath(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustomPath();
                }
              }}
            />
            <Button variant="outline" disabled={!customPath.trim()} onClick={addCustomPath}>
              {t("editor.addPath")}
            </Button>
          </div>
          {customPaths.length > 0 && (
            <div className="csa-chip-row">
              {customPaths.map((path) => (
                <span key={path} className="csa-chip">
                  {path}
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => setSelectedPaths((prev) => prev.filter((item) => item !== path))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="csa-field">
          <span className="csa-label">{t("editor.modelsTitle")}</span>
          <span className="csa-meta">{t("editor.modelsHint")}</span>
          {state.modelGroups.length === 0 ? (
            <p className="csa-meta">{t("editor.modelsEmpty")}</p>
          ) : (
            state.modelGroups.map((group) => {
              const entries = flattenGroupModels(group);
              return (
                <div key={group.id} className="csa-group">
                  <div className="csa-group-head">
                    <span>
                      {group.name} ({group.id})
                    </span>
                    <div className="csa-actions">
                      <button
                        type="button"
                        className="csa-link-btn"
                        onClick={() => setGroupModels(group, true)}
                      >
                        {t("editor.selectAll")}
                      </button>
                      <button
                        type="button"
                        className="csa-link-btn"
                        onClick={() => setGroupModels(group, false)}
                      >
                        {t("editor.clearAll")}
                      </button>
                    </div>
                  </div>
                  {entries.map((entry) => (
                    <label key={modelKey(entry.provider, entry.model)} className="csa-check">
                      <input
                        type="checkbox"
                        checked={modelKeySet.has(modelKey(entry.provider, entry.model))}
                        onChange={() => toggleModel(entry.provider, entry.model)}
                      />
                      <span>
                        {entry.label}
                        <span className="csa-check-sub">{entry.model}</span>
                      </span>
                    </label>
                  ))}
                </div>
              );
            })
          )}
        </div>

        <div className="csa-field">
          <span className="csa-label">{t("editor.capabilitiesTitle")}</span>
          <label className="csa-check">
            <input
              type="checkbox"
              checked={allowWorkspaceFiles}
              onChange={(event) => setAllowWorkspaceFiles(event.target.checked)}
            />
            <span>{t("editor.allowFiles")}</span>
          </label>
          <label className="csa-check">
            <input
              type="checkbox"
              checked={allowTerminal}
              onChange={(event) => setAllowTerminal(event.target.checked)}
            />
            <span>{t("editor.allowTerminal")}</span>
          </label>
        </div>

        {validationError && (
          <p className="csa-error" role="alert">
            {validationError}
          </p>
        )}
      </div>
    </Modal>
  );
}

type ViewState =
  | { kind: "loading" }
  | { kind: "ready"; data: ScopedAccessStateResponse }
  | { kind: "disabled" }
  | { kind: "forbidden" }
  | { kind: "error"; message: string };

function ScopedAccessSection({ t }: { t: Translate }): ReactNode {
  const [view, setView] = useState<ViewState>({ kind: "loading" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ mode: "create" } | { mode: "edit"; key: ScopedKeyView } | null>(
    null,
  );
  const [connecting, setConnecting] = useState<ScopedKeyView | null>(null);
  const [confirming, setConfirming] = useState<
    { kind: "rotate" | "delete"; key: ScopedKeyView } | null
  >(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<ScopedAccessStateResponse>("/state");
      setView({ kind: "ready", data });
    } catch (cause) {
      if (cause instanceof ScopedAccessError && cause.code === "auth/disabled") {
        setView({ kind: "disabled" });
      } else if (cause instanceof ScopedAccessError && cause.code === "auth/forbidden") {
        setView({ kind: "forbidden" });
      } else {
        setView({
          kind: "error",
          message: cause instanceof Error ? cause.message : String(cause),
        });
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (work: () => Promise<ScopedAccessStateResponse>): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const next = await work();
      setView({ kind: "ready", data: next });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      throw cause;
    } finally {
      setBusy(false);
    }
  };

  if (view.kind === "loading") return <p className="csa-meta">{t("page.loading")}</p>;
  if (view.kind === "disabled") return <p className="csa-notice">{t("page.authDisabled")}</p>;
  if (view.kind === "forbidden") return <p className="csa-notice">{t("page.forbidden")}</p>;
  if (view.kind === "error") {
    return (
      <div className="csa-page">
        <p className="csa-error" role="alert">
          {view.message}
        </p>
        <div>
          <Button variant="outline" onClick={() => void load()}>
            {t("page.refresh")}
          </Button>
        </div>
      </div>
    );
  }

  const { data } = view;
  return (
    <div className="csa-page" data-codexhost-scoped-access>
      <header className="csa-header">
        <div>
          <h2 className="csa-title">{t("page.title")}</h2>
          <p className="csa-subtitle">{t("page.subtitle")}</p>
        </div>
        <div className="csa-actions">
          <Button variant="outline" disabled={busy} onClick={() => void load()}>
            {t("page.refresh")}
          </Button>
          <Button
            variant="primary"
            disabled={busy}
            onClick={() => setEditing({ mode: "create" })}
          >
            {t("page.create")}
          </Button>
        </div>
      </header>

      {error && (
        <p className="csa-error" role="alert">
          {error}
        </p>
      )}

      {data.keys.length === 0 ? (
        <p className="csa-notice">{t("page.empty")}</p>
      ) : (
        <div className="csa-list">
          {data.keys.map((item) => (
            <section key={item.id} className="csa-card">
              <div className="csa-card-top">
                <div className="csa-card-name">
                  <span>{item.name}</span>
                  <span className="csa-badge" data-active={item.enabled}>
                    {t(item.enabled ? "key.enabled" : "key.disabled")}
                  </span>
                </div>
                <div className="csa-actions">
                  <Switch
                    checked={item.enabled}
                    disabled={busy}
                    onCheckedChange={(enabled: boolean) => {
                      void runAction(async () => {
                        const res = await apiRequest<{ state: ScopedAccessStateResponse }>(
                          `/keys/${encodeURIComponent(item.id)}`,
                          { method: "PUT", body: JSON.stringify({ enabled }) },
                        );
                        return res.state;
                      }).catch(() => undefined);
                    }}
                  />
                  <Button
                    variant="primary"
                    disabled={busy || !item.enabled}
                    onClick={() => setConnecting(item)}
                  >
                    {t("key.connect")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => setEditing({ mode: "edit", key: item })}
                  >
                    {t("key.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => setConfirming({ kind: "rotate", key: item })}
                  >
                    {t("key.rotate")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => setConfirming({ kind: "delete", key: item })}
                  >
                    {t("key.delete")}
                  </Button>
                </div>
              </div>

              <div className="csa-pills">
                <span className="csa-pill">
                  {t("key.summary", {
                    projects: item.allowedProjectPaths.length,
                    models: item.allowedModels.length,
                  })}
                </span>
                <span className="csa-pill">
                  {t(item.allowWorkspaceFiles ? "key.filesOn" : "key.filesOff")}
                </span>
                <span className="csa-pill">
                  {t(item.allowTerminal ? "key.terminalOn" : "key.terminalOff")}
                </span>
                <span className="csa-pill">
                  {item.lastUsedAt === null
                    ? t("key.neverUsed")
                    : t("key.lastUsed", { time: new Date(item.lastUsedAt).toLocaleString() })}
                </span>
              </div>

              {item.allowedProjectPaths.length > 0 && (
                <div className="csa-path-list">
                  {item.allowedProjectPaths.map((path) => (
                    <span key={path}>{path}</span>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <p className="csa-meta">{t("page.configPath", { path: data.configFile })}</p>

      {editing !== null && (
        <KeyEditorModal
          initial={editing.mode === "edit" ? editing.key : undefined}
          state={data}
          busy={busy}
          onClose={() => setEditing(null)}
          t={t}
          onSubmit={async (input) => {
            await runAction(async () => {
              const res =
                editing.mode === "create"
                  ? await apiRequest<{ key: ScopedKeyView; state: ScopedAccessStateResponse }>(
                      "/keys",
                      { method: "POST", body: JSON.stringify(input) },
                    )
                  : await apiRequest<{ key: ScopedKeyView; state: ScopedAccessStateResponse }>(
                      `/keys/${encodeURIComponent(editing.key.id)}`,
                      { method: "PUT", body: JSON.stringify(input) },
                    );
              setEditing(null);
              if (editing.mode === "create") setConnecting(res.key);
              return res.state;
            });
          }}
        />
      )}

      {connecting !== null && (
        <ConnectModal
          item={connecting}
          networkUrls={data.networkUrls}
          onClose={() => setConnecting(null)}
          t={t}
        />
      )}

      {confirming !== null && (
        <Modal
          open
          onClose={() => {
            if (!busy) setConfirming(null);
          }}
          title={t(confirming.kind === "rotate" ? "confirm.rotateTitle" : "confirm.deleteTitle")}
          closeLabel={t("editor.close")}
          description={t(
            confirming.kind === "rotate" ? "confirm.rotateBody" : "confirm.deleteBody",
            { name: confirming.key.name },
          )}
          footer={
            <>
              <Button variant="outline" disabled={busy} onClick={() => setConfirming(null)}>
                {t("editor.cancel")}
              </Button>
              <Button
                variant="primary"
                disabled={busy}
                onClick={() => {
                  const target = confirming;
                  void runAction(async () => {
                    const res =
                      target.kind === "rotate"
                        ? await apiRequest<{
                            key: ScopedKeyView;
                            state: ScopedAccessStateResponse;
                          }>(`/keys/${encodeURIComponent(target.key.id)}/rotate`, {
                            method: "POST",
                          })
                        : await apiRequest<{ state: ScopedAccessStateResponse }>(
                            `/keys/${encodeURIComponent(target.key.id)}`,
                            { method: "DELETE" },
                          );
                    setConfirming(null);
                    if (target.kind === "rotate" && "key" in res) setConnecting(res.key);
                    return res.state;
                  }).catch(() => undefined);
                }}
              >
                {t(
                  confirming.kind === "rotate"
                    ? "confirm.rotateAction"
                    : "confirm.deleteAction",
                )}
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}

interface ClientPluginContext {
  effect(callback: () => void | (() => void), label?: string): void;
  locale: {
    register(namespace: string, dictionaries: Record<string, Record<string, string>>): () => void;
    bind(namespace: string): Translate;
  };
  slots: {
    inject(name: string, register: () => () => void): () => void;
    register(
      options: {
        name: string;
        id: string;
        order?: number;
        label?: () => string;
        locale?: string;
      },
      component: (props: { t: Translate }) => ReactNode,
    ): () => void;
  };
}

export function apply(ctx: ClientPluginContext): void {
  ctx.effect(() => {
    if (typeof document === "undefined") return;
    const existing = document.getElementById(STYLE_ID);
    if (existing) return;
    const tag = document.createElement("style");
    tag.id = STYLE_ID;
    tag.dataset.plugin = name;
    tag.textContent = CSS;
    document.head.appendChild(tag);
    return () => {
      tag.remove();
    };
  }, `${name}: styles`);

  ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN }), `${name}: locale`);
  const t = ctx.locale.bind(NS);

  let sectionDispose: (() => void) | undefined;
  ctx.effect(() => {
    const controller = new AbortController();
    void fetch("api/auth/status", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return { scope: "full" };
        return (await response.json()) as { scope?: string };
      })
      .then((status) => {
        if (controller.signal.aborted || status.scope === "scoped") return;
        sectionDispose = ctx.slots.inject("settings.section", () =>
          ctx.slots.register(
            {
              name: "settings.section",
              id: "codexhost-scoped-access",
              order: 1.5,
              label: () => t("section.title"),
              locale: NS,
            },
            ScopedAccessSection,
          ),
        );
      })
      .catch(() => undefined);
    return () => {
      controller.abort();
      sectionDispose?.();
      sectionDispose = undefined;
    };
  }, `${name}: settings section`);
}
