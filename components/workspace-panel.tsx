'use client'

import { useState } from 'react'
import { Check, Code2, Copy, Eye, Play, RotateCw, Terminal } from 'lucide-react'
import { ConsoleView } from '@/components/console-view'
import { PreviewFrame } from '@/components/preview-frame'
import { cn, type ConsoleEntry, type SandboxArtifact } from '@/lib/sandbox'

type Tab = 'preview' | 'code'

type WorkspacePanelProps = {
  artifact: SandboxArtifact | null
  code: string
  previewHtml: string
  runKey: string
  hasUnappliedEdits: boolean
  isBusy: boolean
  onCodeChange: (html: string) => void
  onRun: () => void
}

export function WorkspacePanel({
  artifact,
  code,
  previewHtml,
  runKey,
  hasUnappliedEdits,
  isBusy,
  onCodeChange,
  onRun,
}: WorkspacePanelProps) {
  const [tab, setTab] = useState<Tab>('preview')
  const [logs, setLogs] = useState<{ key: string; entries: ConsoleEntry[] }>({ key: runKey, entries: [] })
  const [consoleOpen, setConsoleOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  const entries = logs.key === runKey ? logs.entries : []
  const errorCount = entries.filter((e) => e.level === 'error').length

  const handleLog = (entry: ConsoleEntry) => {
    setLogs((prev) =>
      prev.key === runKey ? { key: runKey, entries: [...prev.entries, entry].slice(-500) } : { key: runKey, entries: [entry] },
    )
  }

  const handleRun = () => {
    onRun()
    setTab('preview')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!artifact) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-surface text-muted">
          <Code2 className="size-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium">{isBusy ? 'Waiting for code...' : 'Sandbox is empty'}</p>
        <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted">
          Code that ChatGPT writes will run here in an isolated iframe with no access to this page.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border px-2">
        <div role="tablist" aria-label="Workspace" className="flex items-center gap-1">
          {(
            [
              { id: 'preview', label: 'Preview', icon: Eye },
              { id: 'code', label: 'Code', icon: Code2 },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors',
                tab === id ? 'bg-surface-raised text-foreground' : 'text-muted hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
          <span className="ml-2 hidden truncate font-mono text-xs text-muted lg:inline">{artifact.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
            <span className="sr-only sm:not-sr-only">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handleRun}
            className={cn(
              'flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors',
              hasUnappliedEdits
                ? 'bg-accent text-accent-foreground'
                : 'text-muted hover:bg-surface-raised hover:text-foreground',
            )}
          >
            {hasUnappliedEdits ? <Play className="size-3.5" aria-hidden="true" /> : <RotateCw className="size-3.5" aria-hidden="true" />}
            {hasUnappliedEdits ? 'Run' : 'Rerun'}
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className={cn('min-h-0 flex-1 bg-white', tab !== 'preview' && 'hidden')}>
          <PreviewFrame key={runKey} html={previewHtml} title={artifact.title} onLog={handleLog} />
        </div>
        {tab === 'code' && (
          <div className="flex min-h-0 flex-1 flex-col">
            <label htmlFor="code-editor" className="sr-only">
              Code editor
            </label>
            <textarea
              id="code-editor"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-background p-4 font-mono text-xs leading-relaxed text-foreground/90 outline-none"
            />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border">
        <button
          type="button"
          onClick={() => setConsoleOpen((o) => !o)}
          aria-expanded={consoleOpen}
          className="flex h-9 w-full items-center gap-2 px-3 text-xs text-muted hover:text-foreground"
        >
          <Terminal className="size-3.5" aria-hidden="true" />
          <span className="font-medium">Console</span>
          <span className="font-mono">{entries.length}</span>
          {errorCount > 0 && (
            <span className="rounded bg-danger/15 px-1.5 py-0.5 font-mono text-danger">
              {errorCount} {errorCount === 1 ? 'error' : 'errors'}
            </span>
          )}
        </button>
        {consoleOpen && <ConsoleView entries={entries} />}
      </div>
    </div>
  )
}
