'use client'

import { useEffect, useEffectEvent, useMemo, useRef } from 'react'
import { withConsoleBridge, type ConsoleEntry, type ConsoleLevel } from '@/lib/sandbox'

const LEVELS: ConsoleLevel[] = ['log', 'info', 'warn', 'error']

type PreviewFrameProps = {
  html: string
  title: string
  onLog: (entry: ConsoleEntry) => void
}

export function PreviewFrame({ html, title, onLog }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const srcDoc = useMemo(() => withConsoleBridge(html), [html])
  const handleLog = useEffectEvent(onLog)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      const data = event.data as { source?: unknown; level?: unknown; text?: unknown }
      if (data?.source !== 'gpt-sandbox-console') return
      const level = LEVELS.includes(data.level as ConsoleLevel) ? (data.level as ConsoleLevel) : 'log'
      handleLog({ level, text: String(data.text ?? '').slice(0, 5000) })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <iframe
      ref={iframeRef}
      title={`Sandbox preview: ${title}`}
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-forms allow-modals allow-popups allow-pointer-lock"
      className="size-full border-0 bg-white"
    />
  )
}
