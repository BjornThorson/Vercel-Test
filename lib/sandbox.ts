import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const MODELS = [
  { id: 'openai/gpt-5.5', label: 'GPT-5.5' },
  { id: 'openai/gpt-5.4-mini', label: 'GPT-5.4 mini' },
  { id: 'openai/gpt-5.3-codex', label: 'GPT-5.3 Codex' },
] as const

export type ModelId = (typeof MODELS)[number]['id']

export const DEFAULT_MODEL: ModelId = MODELS[0].id

export function isModelId(value: unknown): value is ModelId {
  return MODELS.some((m) => m.id === value)
}

export type SandboxArtifact = {
  id: string
  title: string
  html: string
}

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error'

export type ConsoleEntry = {
  level: ConsoleLevel
  text: string
}

const CONSOLE_BRIDGE = `<script>(function(){function fmt(a){if(a instanceof Error)return a.stack||a.message;if(a&&typeof a==='object'){try{return JSON.stringify(a)}catch(e){return String(a)}}return String(a)}function send(level,args){try{parent.postMessage({source:'gpt-sandbox-console',level:level,text:Array.prototype.map.call(args,fmt).join(' ')},'*')}catch(e){}}['log','info','warn','error'].forEach(function(l){var o=console[l];console[l]=function(){send(l,arguments);o.apply(console,arguments)}});window.addEventListener('error',function(e){send('error',[e.message+(e.lineno?' (line '+e.lineno+')':'')])});window.addEventListener('unhandledrejection',function(e){send('error',['Unhandled rejection: '+((e.reason&&e.reason.message)||e.reason)])})})();</script>`

export function withConsoleBridge(html: string) {
  const headTag = html.match(/<head[^>]*>/i)
  if (headTag && headTag.index !== undefined) {
    const at = headTag.index + headTag[0].length
    return html.slice(0, at) + CONSOLE_BRIDGE + html.slice(at)
  }
  return CONSOLE_BRIDGE + html
}
