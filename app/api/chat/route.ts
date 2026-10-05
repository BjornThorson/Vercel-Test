import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  tool,
  type UIMessage,
} from 'ai'
import { z } from 'zod'
import { DEFAULT_MODEL, isModelId } from '@/lib/sandbox'

export const maxDuration = 120

const MAX_CURRENT_CODE = 200_000

const INSTRUCTIONS = `You are a coding assistant working inside a live browser sandbox.

When the user asks you to build, change, or fix something, call the renderSandbox tool with a COMPLETE, self-contained HTML document (<!doctype html> through </html>). Inline all CSS and JavaScript. You may load libraries from public CDNs (e.g. https://cdn.jsdelivr.net, https://unpkg.com, https://cdn.tailwindcss.com). There is no backend, filesystem, or network API beyond public CDNs and public APIs that allow CORS.

The sandbox runs in an isolated iframe without same-origin access: localStorage, cookies and parent-window access are unavailable, so keep state in memory. console.log output and runtime errors are shown to the user.

Always send the full updated document when changing code, never a diff. After the tool call, reply with one or two short sentences summarizing what you built. For questions that need no code, just answer normally.`

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: UIMessage[]
    model?: unknown
    currentCode?: unknown
  }

  if (!Array.isArray(body.messages)) {
    return new Response('Invalid request', { status: 400 })
  }

  const model = isModelId(body.model) ? body.model : DEFAULT_MODEL
  const currentCode =
    typeof body.currentCode === 'string' ? body.currentCode.slice(0, MAX_CURRENT_CODE) : ''

  const instructions = currentCode
    ? `${INSTRUCTIONS}\n\nThe sandbox currently contains this code (it may include manual edits by the user, so build on it):\n\n${currentCode}`
    : INSTRUCTIONS

  const result = streamText({
    model,
    instructions,
    messages: await convertToModelMessages(body.messages),
    stopWhen: isStepCount(3),
    tools: {
      renderSandbox: tool({
        description: 'Render a complete, self-contained HTML document in the live sandbox.',
        inputSchema: z.object({
          title: z.string().describe('Short name for the app, 2-5 words.'),
          html: z.string().describe('The full HTML document with inline CSS and JS.'),
        }),
        execute: async ({ title }) => ({ rendered: true, title }),
      }),
    },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
