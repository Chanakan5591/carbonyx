import type { Route } from './+types/chat'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText, appendResponseMessages } from 'ai'
import { pluem_messages } from '~/db/db'

export async function action(args: Route.ActionArgs) {
  const { messages, id } = await args.request.json()

  const openai = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1'
  })

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    async onFinish({ response }) {
      let newMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages
      })

      let doc
      try {
        doc = await pluem_messages.get(id)
        pluem_messages.insert({ messages: newMessages, _rev: doc._rev }, id)
      } catch (e) {
        pluem_messages.insert({ messages: newMessages }, id)
      }
    }
  })

  return result.toDataStreamResponse()
}


