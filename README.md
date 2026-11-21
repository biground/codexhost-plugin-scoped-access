# codexhost-plugin-scoped-access

为 codexhost Web 远程访问提供**次级访问权限密钥**管理插件：

- 与现有主远程密钥区分权限（不同密钥前缀 `chsk_...`）
- 按项目白名单隔离：次级密钥只能看到并操作授权项目目录及其会话，拒绝跨项目访问与路径穿越
- 按模型白名单隔离：次级密钥只能看到并调用指定的 `(Harness, Model)` 组合，无法切换到未授权模型或使用未授权模型发消息
- 支持查看/下载授权项目内文件（默认开启）与禁止右侧栏终端（默认关闭）
- 自动屏蔽全局管理接口（`/api/ch/v1/*`、界面扩展、连接设备与主密钥管理、全局设置、桌面截图、侧栏浏览器、跨主机远程会话）
- 仅在主密钥 / 本机 Web 的 **设置 → 次级访问权限** 中可视化创建、编辑、扫码连接、重置与吊销

## 构建插件产物

```sh
node plugins/web-scoped-access/build.mjs
```

会生成可直接安装的预构建产物 `lib/index.js` 和 `lib/client.js`（零第三方运行期依赖，支持离线本机安装）。

## 安装与启用

1. 启动包含 `codexhostAccess` 扩展点的 codexhost Web（需开启访问认证，不能使用 `--no-auth`）。
2. 在本机或主密钥浏览器中打开 **设置 → 界面扩展 → 添加扩展**。
3. 输入 GitHub 仓库地址（推荐）或本机目录绝对路径完成安装并启用：
   - GitHub 仓库：`https://github.com/biground/codexhost-plugin-scoped-access`
   - 本机目录：`D:\WorkSpace\Everything\codex-host\plugins\web-scoped-access`
4. 在 **设置 → 次级访问权限** 中创建次级密钥，勾选允许访问的项目与指定模型，扫码或复制登录链接即可在其他设备上以受限权限登录。

## 数据持久化

次级密钥与权限规则保存在当前 Web 数据目录的 `scoped-access/keys.json`（默认 `~/.codexhost/web/scoped-access/keys.json`，权限 `0600`），最近使用时间保存在同目录 `usage.json`。
