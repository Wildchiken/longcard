# Longcard

**中文** | [English](#english)

将文字排版成精美长图，适合微信、小红书等平台分享，也可用于日记、摘抄归档。数据仅存本地，无需账号。

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/fbcaaa81-4f26-410e-ad3b-64646966a439"
    alt="Longcard 界面预览"
    width="920"
  />
</p>

## 功能

- 粘贴文字，实时预览排版效果
- 多种内置风格（纸白、素雅、暗夜学院、手账笔记……）
- 支持 Markdown 语法（标题、引用、加粗、分割线等）
- 导出 PNG / JPEG / WebP / SVG / PDF / HTML / Markdown
- 历史版本：每次保存自动快照，支持回滚
- 中 / English 界面切换
- PWA：可安装到手机主屏幕，离线可用
- 所有数据存储在浏览器本地，不联网，不收集任何信息

## 快速开始

```bash
npm install
npm run dev
# 浏览器打开 http://localhost:3000
```

生产构建：

```bash
npm run build
npm start
```

### GitHub Releases 里的 zip

Release 附件中的 `longcard-v*-static.zip` 是**静态站点**（`next build` + `output: 'export'`）：解压后在该目录执行 `npx --yes serve .` 或 `python3 -m http.server 8080`，用浏览器打开终端里显示的地址。**不要**用 `file://` 直接双击打开 `index.html`，否则路由和资源会失败。压缩包内附有 `STATIC_HOSTING.txt` 说明。

Longcard 是浏览器里运行的 Web 应用，**没有** Windows `.exe` / macOS `.app` 这类单机可执行文件；若需要桌面壳需自行用 Tauri、Electron 等打包。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| State | Zustand |
| Storage | Dexie (IndexedDB) |
| Image export | html-to-image, jsPDF |
| Canvas editor | Fabric.js |

## License

[MIT](./LICENSE)

---

<a id="english"></a>

# Longcard

Turn plain text into beautifully typeset long images — great for sharing on WeChat, Xiaohongshu, or archiving personal notes. All data stays local, no account needed.

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/fbcaaa81-4f26-410e-ad3b-64646966a439"
    alt="Longcard screenshot"
    width="920"
  />
</p>

## Features

- Paste text, see live layout preview
- Multiple built-in themes (Paper White, Elegant, Dark Academia, Journal…)
- Markdown support (headings, blockquotes, bold, dividers…)
- Export to PNG / JPEG / WebP / SVG / PDF / HTML / Markdown
- Version history with one-click restore
- Chinese / English UI toggle
- PWA: installable, works offline
- Fully local — no server, no tracking

## Getting started

```bash
npm install
npm run dev
# open http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

### Release zip (static export)

The `longcard-v*-static.zip` asset is a **static site** export. After unzipping, run `npx --yes serve .` or `python3 -m http.server 8080` in that folder and open the URL in a browser. **Do not** open `index.html` via `file://`. See `STATIC_HOSTING.txt` inside the zip.

This project is a **web app** (runs in the browser). There is **no** standalone `.exe` / `.app`; use a desktop wrapper (Electron, Tauri, etc.) if you need one.

## Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| State | Zustand |
| Storage | Dexie (IndexedDB) |
| Image export | html-to-image, jsPDF |
| Canvas editor | Fabric.js |

## License

[MIT](./LICENSE)
