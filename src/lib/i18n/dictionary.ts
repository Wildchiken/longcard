import type { AppLocale } from '@/lib/settings'
import { interpolate } from '@/lib/i18n/interpolate'

export type MessageKey = keyof typeof zhMessages

const zhMessages = {
  'lang.switch': '切换界面语言',
  'lang.zh': '中文',
  'lang.en': 'English',

  'theme.dark': '切换深色模式',
  'theme.light': '切换浅色模式',

  'localHint.bold': '作品仅保存在本浏览器。',
  'localHint.body':
    '清除网站数据、换设备或换浏览器后可能无法恢复；建议定期导出图片，或用下方按钮保存 .md 文字备份。',
  'localHint.exportBackup': '导出文字备份',
  'localHint.dismiss': '知道了',

  'backup.defaultName': '文字备份',

  'recent.myWorks': '我的作品',
  'recent.newZine': '新建长图',
  'recent.loading': '加载中…',
  'recent.empty': '暂无保存的作品',
  'recent.emptyHint': '编辑完成后点击「保存」即可记录',
  'recent.section': '最近作品',
  'recent.current': '· 当前',
  'recent.thumbChar': '文',
  'recent.untitled': '未命名',
  'recent.deleteConfirm': '删除「{title}」？此操作不可撤销。',
  'recent.deleteAria': '删除',
  'recent.viewAll': '查看全部',

  'toast.saveFailed': '保存失败：{detail}',
  'toast.captureFailed': '无法生成预览图，请稍后重试。',
  'toast.loadFailed': '未找到该作品，可能已被删除或链接无效。',
  'toast.shareFailed': '分享未成功。可改用「导出」保存图片后手动发送。',
  'toast.galleryLoadFailed': '作品列表加载失败，请刷新页面重试。',
  'toast.recentListFailed': '最近作品列表加载失败，请稍后重试。',
  'toast.deleteFailed': '删除失败，请重试。',

  'gallery.back': '返回创作',
  'gallery.title': '作品库',
  'gallery.longPages': '长图作品',
  'gallery.canvasWorks': '画布作品',
  'gallery.emptyTitle': '还没有作品',
  'gallery.emptyHint': '前往创作台，生成你的第一张长图',
  'gallery.startCreate': '开始创作',
  'gallery.badgeLong': '长图',

  'compose.galleryLinkAria': '打开作品库',
  'compose.step1': '第 1 步：输入文字',
  'compose.addImage': '添加图片',
  'compose.addImageAria': '在光标段落后插入图片',
  'compose.addImageHint': '图片将插入到光标所在段落之后',
  'compose.fillSample': '填入示例',
  'compose.fillSampleAria': '填入示例文字',
  'compose.replaceSampleConfirm': '将用示例文字替换当前内容，确定吗？',
  'compose.clear': '清除',
  'compose.clearAria': '清除全部内容',
  'compose.chars': '{n} 字符',
  'compose.charsHan': '（含 {n} 汉字）',
  'compose.tip':
    '可直接粘贴文章、笔记。首行会作为标题，空行分段；点上方「填入示例」可快速看效果。',
  'compose.titleLabel': '作品标题',
  'compose.titlePlaceholder': '输入作品标题…',
  'compose.titleAria': '作品标题',
  'compose.undo': '撤销',
  'compose.undoTitle': '撤销 (⌘Z)',
  'compose.redo': '重做',
  'compose.redoTitle': '重做 (⌘⇧Z)',
  'compose.new': '新建',
  'compose.newAria': '新建作品',
  'compose.style': '样式',
  'compose.styleAria': '打开样式面板',
  'compose.save': '保存',
  'compose.saved': '已保存',
  'compose.saveAria': '保存作品',
  'compose.export': '导出',
  'compose.exportAria': '导出长图',
  'compose.tabWrite': '编写',
  'compose.tabPreview': '预览',
  'compose.step2': '第 2 步：选择风格',
  'compose.styleAdjust': '样式调整',
  'compose.styleAdjustAria': '打开样式调整面板',
  'compose.step3Preview': '第 3 步：预览',
  'compose.fullscreen': '全屏',
  'compose.fullscreenTitle': '全屏预览',
  'compose.fullscreenAria': '全屏预览',
  'compose.share': '分享',
  'compose.shareAria': '分享长图',
  'compose.sideStyle': '样式调整',
  'compose.sideHistory': '历史版本',
  'compose.closePanelAria': '关闭面板',

  'history.loading': '加载中…',
  'history.empty': '暂无历史版本',
  'history.emptyHint': '每次保存作品时自动创建一个版本快照',
  'history.untitled': '未命名',
  'history.restore': '恢复此版本',
  'history.restoring': '恢复中…',
  'history.restoreError': '恢复版本失败，请重试',
  'history.deleteError': '删除版本失败，请重试',
  'history.loadError': '加载历史版本失败，请重试',

  'template.customized': '已自定义',
  'template.myTemplates': '我的模版',
  'template.builtIn': '内置风格',
  'template.deleteError': '删除模版失败，请重试',

  'image.deleteAria': '删除图片',
  'image.uploadError': '图片添加失败，请重试',
  'compose.errorWebp': 'WebP 导出失败',
  'compose.errorBlob': '无法生成图片',

  'compose.emptyPreviewTitle': '预览将在此显示',
  'compose.emptyPreviewMobile': '切换到「编写」标签，输入你的文字',
  'compose.emptyPreviewDesktop': '在左侧输入文字，右侧实时生成长图',
  'compose.goWrite': '去编写文字',

  'fullscreen.title': '全屏预览',
  'fullscreen.esc': 'Esc 关闭',
  'fullscreen.closeAria': '关闭全屏预览',
  'fullscreen.dialogAria': '全屏预览',

  'export.dialogTitle': '导出',
  'export.sectionImage': '图片格式',
  'export.sectionDoc': '文档格式',
  'export.sectionScale': '分辨率',
  'export.scale2': '标准 @2×',
  'export.scale3': '高清 @3×',
  'export.scaleHint3': '推荐，适合手机/朋友圈分享',
  'export.scaleHint2': '文件较小，适合网络传输',
  'export.sectionCheck': '导出检查',
  'export.allClear': '所有检查通过，可以导出',
  'export.cancel': '取消',
  'export.fail': '导出失败，请重试或更换其它格式（如 PNG）',
  'export.done': '完成',
  'export.fixFirst': '修复后导出',
  'export.copyImage': '复制图片',
  'export.confirmFmt': '导出 {label}',
  'export.defaultImageName': '长图',

  'export.fmt.clipboard.label': '复制图片',
  'export.fmt.png.hint': '无损，适合文字内容',
  'export.fmt.jpeg.hint': '体积小，适合有背景色',
  'export.fmt.webp.hint': '现代格式，兼顾质量和体积',
  'export.fmt.svg.hint': '矢量无损，适合印刷',
  'export.fmt.clipboard.hint': '直接粘贴，无需下载文件',
  'export.fmt.pdf.hint': '通用文档，适合打印分发',
  'export.fmt.html.hint': '网页格式，可在浏览器查看',
  'export.fmt.markdown.hint': '导出源文本，可用于 Notion/Obsidian',

  'input.placeholder': `在这里输入或粘贴你的文字...

支持简单的 Markdown 语法：
# 标题（# 开头）
## 小标题（## 开头）
> 引用文字（> 开头）
- 无序列表（- 开头）
1. 有序列表（数字 + . 开头）
--- 分割线

空行自动分段，首行自动识别为标题。`,

  'preflight.empty-content.message': '内容为空，无法导出',
  'preflight.empty-content.hint': '请先在左侧输入文字',
  'preflight.low-contrast.message': '文字与背景对比度过低（{ratio}:1）',
  'preflight.low-contrast.hint': '建议对比度不低于 4.5:1（WCAG AA），请调整配色',
  'preflight.contrast-warn.message': '对比度偏低（{ratio}:1）',
  'preflight.contrast-warn.hint': '在暗光环境下可能较难阅读，建议调整文字或背景颜色',
  'preflight.font-too-small.message': '正文字号偏小（{size}px）',
  'preflight.font-too-small.hint': '在移动设备上可读性较差，建议设为 12px 以上',
  'preflight.title-too-large.message': '标题字号较大（{size}px）',
  'preflight.title-too-large.hint': '超大标题在手机端可能导致意外换行，建议确认预览效果',
  'preflight.no-title.message': '未检测到标题块',
  'preflight.no-title.hint': '建议以 # 开头的一行作为标题，增强视觉层级',
  'preflight.social-share-tip.message': '分享到聊天或朋友圈前的小提示',
  'preflight.social-share-tip.hint':
    '微信、小红书等 App 可能对长图自动压缩或限制高度；若发现模糊，可尝试「原图发送」或拆成多张导出。',
  'preflight.long-image.message': '内容约 {chars} 字，单张长图会非常高、文件也大',
  'preflight.long-image.hint':
    '极易触发微信等平台压图或发送失败。建议拆成多篇分别导出，或先导出 PDF/HTML 再按需截图。',
  'preflight.long-pdf.message': '内容较长，PDF 页数会较多',
  'preflight.long-pdf.hint': '首次打开或分享时可能稍慢，属正常现象。',
  'preflight.width-clip.message': '导出宽度（{exportW}px）小于内容宽度（{contentW}px）',
  'preflight.width-clip.hint': '内容可能被截断，建议增大导出宽度或减小内容宽度',
  'preflight.padding-too-large.message': '左右留白比例较大，实际文字区域较窄',
  'preflight.padding-too-large.hint': '可适当减小左右留白或增大内容宽度',
} as const

const enMessages: Record<MessageKey, string> = {
  'lang.switch': 'Switch language',
  'lang.zh': '中文',
  'lang.en': 'English',

  'theme.dark': 'Switch to dark mode',
  'theme.light': 'Switch to light mode',

  'localHint.bold': 'Your work is stored only in this browser.',
  'localHint.body':
    'Clearing site data, switching devices, or browsers may make it unrecoverable. Export images regularly, or save a .md backup below.',
  'localHint.exportBackup': 'Export text backup',
  'localHint.dismiss': 'Got it',

  'backup.defaultName': 'text-backup',

  'recent.myWorks': 'My works',
  'recent.newZine': 'New zine',
  'recent.loading': 'Loading…',
  'recent.empty': 'No saved works yet',
  'recent.emptyHint': 'Click Save after editing to keep a copy here',
  'recent.section': 'Recent',
  'recent.current': '· current',
  'recent.thumbChar': 'A',
  'recent.untitled': 'Untitled',
  'recent.deleteConfirm': 'Delete “{title}”? This cannot be undone.',
  'recent.deleteAria': 'Delete',
  'recent.viewAll': 'View all',

  'toast.saveFailed': 'Could not save: {detail}',
  'toast.captureFailed': 'Could not capture preview. Try again.',
  'toast.loadFailed': 'Work not found. It may have been deleted or the link is invalid.',
  'toast.shareFailed': 'Share did not complete. Try Export, then send the image manually.',
  'toast.galleryLoadFailed': 'Could not load the library. Refresh and try again.',
  'toast.recentListFailed': 'Could not load recent works. Try again.',
  'toast.deleteFailed': 'Could not delete. Please try again.',

  'gallery.back': 'Back to editor',
  'gallery.title': 'Library',
  'gallery.longPages': 'Long images',
  'gallery.canvasWorks': 'Canvas',
  'gallery.emptyTitle': 'No works yet',
  'gallery.emptyHint': 'Open the editor and save your first long image',
  'gallery.startCreate': 'Start creating',
  'gallery.badgeLong': 'Long',

  'compose.galleryLinkAria': 'Open library',
  'compose.step1': 'Step 1: Write',
  'compose.addImage': 'Image',
  'compose.addImageAria': 'Insert image after current paragraph',
  'compose.addImageHint': 'Image will be inserted after the paragraph at the cursor',
  'compose.fillSample': 'Sample',
  'compose.fillSampleAria': 'Insert sample text',
  'compose.replaceSampleConfirm': 'Replace current text with the sample?',
  'compose.clear': 'Clear',
  'compose.clearAria': 'Clear all text',
  'compose.chars': '{n} characters',
  'compose.charsHan': ' ({n} CJK)',
  'compose.tip':
    'Paste notes or articles. First line becomes the title; blank lines split paragraphs. Use Sample above for a quick demo.',
  'compose.titleLabel': 'Title',
  'compose.titlePlaceholder': 'Title…',
  'compose.titleAria': 'Work title',
  'compose.undo': 'Undo',
  'compose.undoTitle': 'Undo (⌘Z)',
  'compose.redo': 'Redo',
  'compose.redoTitle': 'Redo (⌘⇧Z)',
  'compose.new': 'New',
  'compose.newAria': 'New work',
  'compose.style': 'Style',
  'compose.styleAria': 'Open style panel',
  'compose.save': 'Save',
  'compose.saved': 'Saved',
  'compose.saveAria': 'Save work',
  'compose.export': 'Export',
  'compose.exportAria': 'Export image',
  'compose.tabWrite': 'Write',
  'compose.tabPreview': 'Preview',
  'compose.step2': 'Step 2: Look',
  'compose.styleAdjust': 'Style',
  'compose.styleAdjustAria': 'Open style panel',
  'compose.step3Preview': 'Step 3: Preview',
  'compose.fullscreen': 'Full',
  'compose.fullscreenTitle': 'Fullscreen preview',
  'compose.fullscreenAria': 'Fullscreen preview',
  'compose.share': 'Share',
  'compose.shareAria': 'Share image',
  'compose.sideStyle': 'Style',
  'compose.sideHistory': 'History',
  'compose.closePanelAria': 'Close panel',

  'history.loading': 'Loading…',
  'history.empty': 'No history yet',
  'history.emptyHint': 'A snapshot is created each time you save',
  'history.untitled': 'Untitled',
  'history.restore': 'Restore',
  'history.restoring': 'Restoring…',
  'history.restoreError': 'Could not restore version. Try again.',
  'history.deleteError': 'Could not delete version. Try again.',
  'history.loadError': 'Could not load history. Try again.',

  'template.customized': 'Customized',
  'template.myTemplates': 'My templates',
  'template.builtIn': 'Built-in',
  'template.deleteError': 'Could not delete template. Try again.',

  'image.deleteAria': 'Remove image',
  'image.uploadError': 'Could not add image. Please try again.',
  'compose.errorWebp': 'WebP export failed',
  'compose.errorBlob': 'Could not create image',

  'compose.emptyPreviewTitle': 'Preview appears here',
  'compose.emptyPreviewMobile': 'Open the Write tab and enter your text',
  'compose.emptyPreviewDesktop': 'Type on the left; the long image updates on the right',
  'compose.goWrite': 'Go to Write',

  'fullscreen.title': 'Fullscreen',
  'fullscreen.esc': 'Esc to close',
  'fullscreen.closeAria': 'Close fullscreen',
  'fullscreen.dialogAria': 'Fullscreen preview',

  'export.dialogTitle': 'Export',
  'export.sectionImage': 'Image',
  'export.sectionDoc': 'Document',
  'export.sectionScale': 'Resolution',
  'export.scale2': 'Standard @2×',
  'export.scale3': 'HD @3×',
  'export.scaleHint3': 'Best for phones and social feeds',
  'export.scaleHint2': 'Smaller files, good for the web',
  'export.sectionCheck': 'Checks',
  'export.allClear': 'All checks passed',
  'export.cancel': 'Cancel',
  'export.fail': 'Export failed. Try again or pick another format (e.g. PNG).',
  'export.done': 'Done',
  'export.fixFirst': 'Fix issues first',
  'export.copyImage': 'Copy image',
  'export.confirmFmt': 'Export {label}',
  'export.defaultImageName': 'zine',

  'export.fmt.clipboard.label': 'Copy image',
  'export.fmt.png.hint': 'Lossless; great for text',
  'export.fmt.jpeg.hint': 'Smaller; good with photos or gradients',
  'export.fmt.webp.hint': 'Modern; balances size and quality',
  'export.fmt.svg.hint': 'Vector; sharp at any size',
  'export.fmt.clipboard.hint': 'Paste elsewhere without a file',
  'export.fmt.pdf.hint': 'Universal; print-friendly',
  'export.fmt.html.hint': 'Open in any browser',
  'export.fmt.markdown.hint': 'Source text for Notion, Obsidian, etc.',

  'input.placeholder': `Type or paste your text here...

Simple Markdown:
# Title
## Subtitle
> Quote
- Bullet list
1. Numbered list
--- divider

Blank lines split paragraphs. The first line can be used as the title.`,

  'preflight.empty-content.message': 'Nothing to export',
  'preflight.empty-content.hint': 'Add text on the left first',
  'preflight.low-contrast.message': 'Text/background contrast is low ({ratio}:1)',
  'preflight.low-contrast.hint': 'Aim for at least 4.5:1 (WCAG AA); adjust colors',
  'preflight.contrast-warn.message': 'Contrast is a bit low ({ratio}:1)',
  'preflight.contrast-warn.hint': 'May be hard to read in dim light',
  'preflight.font-too-small.message': 'Body text is small ({size}px)',
  'preflight.font-too-small.hint': 'On phones, 12px or more is easier to read',
  'preflight.title-too-large.message': 'Title is very large ({size}px)',
  'preflight.title-too-large.hint': 'May wrap oddly on small screens—check the preview',
  'preflight.no-title.message': 'No title block detected',
  'preflight.no-title.hint': 'A line starting with # helps visual hierarchy',
  'preflight.social-share-tip.message': 'Before sharing in chat or stories',
  'preflight.social-share-tip.hint':
    'Some apps compress or crop tall images. Send as “original” if available, or split into multiple exports.',
  'preflight.long-image.message': 'About {chars} characters—one image will be very tall and heavy',
  'preflight.long-image.hint':
    'Apps may compress or fail to send. Split into parts, or export PDF/HTML and screenshot as needed.',
  'preflight.long-pdf.message': 'Long content means more PDF pages',
  'preflight.long-pdf.hint': 'First open or share may take a moment—that is normal.',
  'preflight.width-clip.message': 'Export width ({exportW}px) is narrower than layout ({contentW}px)',
  'preflight.width-clip.hint': 'Content may be clipped—increase export width or reduce layout width',
  'preflight.padding-too-large.message': 'Side padding uses a lot of horizontal space',
  'preflight.padding-too-large.hint': 'Try less padding or a wider content area',

}

export const messages: Record<AppLocale, Record<string, string>> = {
  zh: zhMessages,
  en: enMessages,
}

export function translate(
  locale: AppLocale,
  key: string,
  params?: Record<string, string | number>
): string {
  const table = messages[locale]
  const raw = table[key] ?? messages.zh[key] ?? key
  return interpolate(raw, params)
}
