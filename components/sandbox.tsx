'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useMemo, useState } from 'react'
import { Code2, MessageSquare, Play, Plus, Terminal } from 'lucide-react'
import { ChatPanel } from '@/components/chat-panel'
import { WorkspacePanel } from '@/components/workspace-panel'
import { cn, DEFAULT_MODEL, MODELS, type ModelId, type SandboxArtifact } from '@/lib/sandbox'

type ToolPartLike = {
  type: string
  toolCallId?: string
  state?: string
  input?: { title?: unknown; html?: unknown }
}

function findLatestArtifact(messages: UIMessage[]): SandboxArtifact | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const parts = messages[i].parts as ToolPartLike[]
    for (let j = parts.length - 1; j >= 0; j--) {
      const part = parts[j]
      if (
        part.type === 'tool-renderSandbox' &&
        (part.state === 'input-available' || part.state === 'output-available') &&
        typeof part.input?.html === 'string'
      ) {
        return {
          id: part.toolCallId ?? `${i}-${j}`,
          title: typeof part.input.title === 'string' ? part.input.title : 'Untitled',
          html: part.input.html,
        }
      }
    }
  }
  return null
}

type MobileView = 'chat' | 'workspace'

export function Sandbox() {
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL)
  const [draft, setDraft] = useState<{ id: string; html: string } | null>(null)
  const [applied, setApplied] = useState<{ id: string; html: string; run: number } | null>(null)
  const [mobileView, setMobileView] = useState<MobileView>('chat')
  const [chatKey, setChatKey] = useState(0)

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    id: `sandbox-${chatKey}`,
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const artifact = useMemo(() => findLatestArtifact(messages), [messages])

  const code = artifact ? (draft?.id === artifact.id ? draft.html : artifact.html) : ''
  const previewHtml = artifact ? (applied?.id === artifact.id ? applied.html : artifact.html) : ''
  const runKey = artifact ? `${artifact.id}:${applied?.id === artifact.id ? applied.run : 0}` : 'empty'
  const hasUnappliedEdits = artifact !== null && code !== previewHtml

  const handleSend = (text: string) => {
    sendMessage({ text }, { body: { model, currentCode: code } })
  }

  const handleRun = () => {
    if (!artifact) return
    setApplied((prev) => ({ id: artifact.id, html: code, run: (prev?.run ?? 0) + 1 }))
  }

  const handleNewChat = () => {
    stop()
    setMessages([])
    setDraft(null)
    setApplied(null)
    setChatKey((k) => k + 1)
    setMobileView('chat')
  }

  const isBusy = status === 'submitted' || status === 'streaming'

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Terminal className="size-4" aria-hidden="true" />
          </div>
          <h1 className="truncate text-sm font-semibold tracking-tight">GPT Sandbox</h1>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="model" className="sr-only">
            Model
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value as ModelId)}
            className="h-8 rounded-md border border-border bg-surface px-2 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleNewChat}
            className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">New</span>
            <span className="sr-only sm:hidden">New chat</span>
          </button>
        </div>
      </header>

      <nav
        aria-label="View"
        className="flex shrink-0 gap-1 border-b border-border p-1.5 md:hidden"
      >
        {(
          [
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'workspace', label: 'Sandbox', icon: artifact ? Play : Code2 },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={mobileView === id}
            onClick={() => setMobileView(id)}
            className={cn(
              'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors',
              mobileView === id ? 'bg-surface-raised text-foreground' : 'text-muted hover:text-foreground',
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
            {id === 'workspace' && artifact && mobileView !== 'workspace' && (
              <span className="size-1.5 rounded-full bg-accent" aria-label="Has output" />
            )}
          </button>
        ))}
      </nav>

      <main className="flex min-h-0 flex-1">
        <div
          className={cn(
            'min-h-0 w-full flex-col border-border md:flex md:w-[400px] md:shrink-0 md:border-r',
            mobileView === 'chat' ? 'flex' : 'hidden',
          )}
        >
          <ChatPanel
            key={chatKey}
            messages={messages}
            isBusy={isBusy}
            error={error}
            onSend={handleSend}
            onStop={stop}
            onOpenSandbox={() => setMobileView('workspace')}
          />
        </div>
        <div
          className={cn(
            'min-h-0 min-w-0 flex-1 flex-col md:flex',
            mobileView === 'workspace' ? 'flex' : 'hidden',
          )}
        >
          <WorkspacePanel
            artifact={artifact}
            code={code}
            previewHtml={previewHtml}
            runKey={runKey}
            hasUnappliedEdits={hasUnappliedEdits}
            isBusy={isBusy}
            onCodeChange={(html) => artifact && setDraft({ id: artifact.id, html })}
            onRun={handleRun}
          />
        </div>
      </main>
    </div>
  )
}
