'use client'

import type { UIMessage } from 'ai'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Box, Loader2, Square } from 'lucide-react'
import { cn } from '@/lib/sandbox'

const SUGGESTIONS = [
  'Build a snake game with a score counter',
  'Make a Pomodoro timer with a circular progress ring',
  'Create an interactive bar chart of random data with Chart.js',
  'Write a JS function that finds primes under 1000 and log them',
]

type ToolPartLike = {
  type: string
  toolCallId?: string
  state?: string
  input?: { title?: unknown }
}

type ChatPanelProps = {
  messages: UIMessage[]
  isBusy: boolean
  error: Error | undefined
  onSend: (text: string) => void
  onStop: () => void
  onOpenSandbox: () => void
}

export function ChatPanel({ messages, isBusy, error, onSend, onStop, onOpenSandbox }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isBusy) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
        {messages.length === 0 ? (
          <EmptyState onPick={submit} />
        ) : (
          <ol className="flex flex-col gap-5">
            {messages.map((message) => (
              <li key={message.id} className={cn('flex', message.role === 'user' && 'justify-end')}>
                {message.role === 'user' ? (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-surface-raised px-3.5 py-2.5 text-sm leading-relaxed">
                    {message.parts.map((p, i) => (p.type === 'text' ? <span key={i}>{p.text}</span> : null))}
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-col gap-2.5 text-sm leading-relaxed">
                    {(message.parts as ToolPartLike[]).map((part, i) => {
                      if (part.type === 'text') {
                        const text = (part as unknown as { text: string }).text
                        return text ? (
                          <p key={i} className="whitespace-pre-wrap text-pretty text-foreground/90">
                            {text}
                          </p>
                        ) : null
                      }
                      if (part.type === 'tool-renderSandbox') {
                        return <ToolCard key={part.toolCallId ?? i} part={part} onOpen={onOpenSandbox} />
                      }
                      return null
                    })}
                  </div>
                )}
              </li>
            ))}
            {isBusy && messages[messages.length - 1]?.role === 'user' && (
              <li className="flex items-center gap-2 text-xs text-muted">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Thinking
              </li>
            )}
          </ol>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            Something went wrong. Please try again.
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
        className="shrink-0 border-t border-border p-3"
      >
        <div className="flex items-end gap-2 rounded-lg border border-border bg-surface p-2 focus-within:border-accent/60">
          <label htmlFor="prompt" className="sr-only">
            Message
          </label>
          <textarea
            id="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                if (e.nativeEvent.isComposing || e.keyCode === 229) return
                e.preventDefault()
                submit(input)
              }
            }}
            rows={2}
            placeholder="Ask ChatGPT to build something..."
            className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-1.5 py-1 text-sm text-foreground outline-none placeholder:text-muted"
          />
          {isBusy ? (
            <button
              type="button"
              onClick={onStop}
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-raised text-foreground hover:bg-border"
            >
              <Square className="size-3.5 fill-current" aria-hidden="true" />
              <span className="sr-only">Stop generating</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground transition-opacity disabled:opacity-40"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
              <span className="sr-only">Send message</span>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-balance text-xl font-semibold tracking-tight">What should ChatGPT build?</h2>
        <p className="text-pretty text-sm leading-relaxed text-muted">
          Describe an app, game, or script. The model writes the code and it runs instantly in an isolated sandbox.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-left text-sm text-foreground/90 transition-colors hover:border-accent/50 hover:bg-surface-raised"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ToolCard({ part, onOpen }: { part: ToolPartLike; onOpen: () => void }) {
  const done = part.state === 'output-available' || part.state === 'input-available'
  const failed = part.state === 'output-error'
  const title = typeof part.input?.title === 'string' ? part.input.title : null

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-accent/50 md:pointer-events-none"
    >
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-md',
          failed ? 'bg-danger/15 text-danger' : 'bg-accent/15 text-accent',
        )}
      >
        {done || failed ? <Box className="size-4" aria-hidden="true" /> : <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title ?? 'Writing code...'}</p>
        <p className="font-mono text-xs text-muted">
          {failed ? 'Failed to render' : done ? 'Running in sandbox' : 'Generating'}
        </p>
      </div>
    </button>
  )
}
