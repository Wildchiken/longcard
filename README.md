# Longcard

**中文** | [English](#english)

将文字排版成精美长图，适合微信、小红书等平台分享，也可用于日记、摘抄归档。数据仅存本地，无需账号。

<!-- screenshot -->
![预览图](./docs/preview.png)

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
# 打开 http://localhost:3000
```

```bash
# 构建生产版本
npm run build
npm start
```

## 技术栈

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| State | Zustand |
| Storage | Dexie (IndexedDB) |
| Image export | html-to-image, jsPDF |
| Canvas editor | Fabric.js |

## License

[MIT](./LICENSE)

---

<a name="english"></a>

# Longcard

Turn plain text into beautifully typeset long images — great for sharing on WeChat, Xiaohongshu, or archiving personal notes. All data stays local, no account needed.

<!-- screenshot -->
![Preview](./docs/preview.png)

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

## License

[MIT](./LICENSE)
