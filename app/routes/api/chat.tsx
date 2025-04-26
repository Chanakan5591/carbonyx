import type { Route } from './+types/chat'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText, appendResponseMessages } from 'ai'
import { pluem_messages } from '~/db/db'

export async function action(args: Route.ActionArgs) {
  const body = await args.request.json()
  const { messages, id } = body

  console.log("Chat endpoint received request:", {
    id,
    messageCount: messages.length,
    lastMessage: messages[messages.length - 1]
  })

  const openai = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1'
  })

  try {
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages,
      async onFinish({ response }) {
        console.log("AI response received")
        let newMessages = appendResponseMessages({
          messages,
          responseMessages: response.messages
        })

        let doc
        try {
          doc = await pluem_messages.get(id)
          await pluem_messages.insert({ messages: newMessages, _rev: doc._rev }, id)
          console.log("Messages updated in database")
        } catch (e) {
          await pluem_messages.insert({ messages: newMessages }, id)
          console.log("New messages document created")
        }
      }
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat endpoint:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
