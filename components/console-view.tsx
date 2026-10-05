'use client'

import { useEffect, useRef } from 'react'
import { cn, type ConsoleEntry } from '@/lib/sandbox'

export function ConsoleView({ entries }: { entries: ConsoleEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries])

  return (
    <div ref={ref} className="h-36 overflow-y-auto border-t border-border bg-background font-mono text-xs" role="log">
      {entries.length === 0 ? (
        <p className="px-3 py-2 text-muted">No output yet.</p>
      ) : (
        <ol>
          {entries.map((entry, i) => (
            <li
              key={i}
              className={cn(
                'whitespace-pre-wrap break-words border-b border-border/50 px-3 py-1.5',
                entry.level === 'error' && 'bg-danger/10 text-danger',
                entry.level === 'warn' && 'bg-warning/10 text-warning',
                (entry.level === 'log' || entry.level === 'info') && 'text-foreground/85',
              )}
            >
              {entry.text}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
