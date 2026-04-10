import type { AppLocale } from '@/lib/settings'

/** 朴素摘抄 + 常见名句，适用笔记/摘抄/随笔等场景；含基础 Markdown 演示 */
const SAMPLE_ZH = `摘抄

> 己所不欲，勿施于人。  
> —— 《论语》

## 随记

- 一句触动你的话
- 一两句自己的话

**留白**，留给以后补充。`

const SAMPLE_EN = `Notes

> Do not impose on others what you yourself do not desire.  
> — *Analects* (Yan Yuan)

## Today

- A line that stayed with you
- A few words of your own

**Space** to fill in later.`

export function getSampleDemoText(locale: AppLocale): string {
  return locale === 'en' ? SAMPLE_EN : SAMPLE_ZH
}
