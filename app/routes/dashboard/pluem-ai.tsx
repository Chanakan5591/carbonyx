import { css } from "carbonyxation/css";
import { flex, hstack, vstack } from "carbonyxation/patterns";
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { ArrowUp } from "lucide-react";
import { button } from "~/components/button";
import { useEffect, useState } from "react";
import { NotebookItem } from "~/components/notebookitem";
import type { Route } from "./+types/pluem-ai";
import { db } from "~/db/db";
import { notebook, notebookMessage, type NotebookMessage } from "~/db/schema";
import { getAuth } from "@clerk/react-router/ssr.server";
import { eq, and } from 'drizzle-orm'
import { redirect } from 'react-router'
import { MessageBubble } from "~/components/messagebubble";

export async function loader(args: Route.LoaderArgs) {
  const notebookId = args.params.notebookId
  const auth = await getAuth(args)
  const orgId = auth.orgId
  const userId = auth.userId

  if (!orgId || !userId) throw redirect('/')

  const notebooks = await db.select().from(notebook).where(and(eq(notebook.orgId, orgId), eq(notebook.userId, userId)))
  let messages: NotebookMessage[] = []

  if (notebookId) {
    messages = await db.select().from(notebookMessage).where(eq(notebookMessage.notebookId, notebookId))
  }

  return { notebooks, messages }
}

export default function PluemAI({ loaderData }: Route.ComponentProps) {
  const [emptyConvo, setEmptyConvo] = useState(true)

  useEffect(() => {
    if (loaderData.messages.length === 0) {
      setEmptyConvo(true)
    } else {
      setEmptyConvo(false)
    }
  }, [loaderData.messages.length])

  return (
    <PanelGroup direction="horizontal">
      <Panel minSize={30} defaultSize={30} maxSize={60}>
        <div className={vstack({
          p: 4,
          pt: 3,
          height: 'full'
        })}>
          <button className={button({
            variant: 'solid',
            color: 'primary'
          })}><span className={css({
            p: 2
          })}>New Notebook</span></button>
          <div className={css({
            bgColor: 'white',
            borderColor: 'black',
            border: 'solid',
            borderWidth: 1,
            rounded: '2xl',
            height: 'full',
            width: 'full',
            overflow: 'hidden'
          })}>
            {loaderData.notebooks.map((notebook) => (
              <NotebookItem title={notebook.name} date={new Date(notebook.timestamp).toLocaleString()} notebookId={notebook.id} />
            ))}
          </div>
        </div>
      </Panel>
      <PanelResizeHandle className={css({
        borderColor: "neutral.400",
        borderWidth: 1
      })} />
      <Panel>
        <div className={css({
          height: '100%',
          width: '100%',
          padding: 4
        })}>
          <div className={flex({
            flexDir: 'column',
            justifyContent: 'space-between',
            bg: 'white',
            height: '100%',
            width: '100%',
            rounded: '2xl',
            border: 'solid',
            borderWidth: '1',
            borderColor: 'black',
            overflow: 'auto'
          })}>

            {emptyConvo ? (
              <div className={flex({
                margin: 12,
                marginTop: 32,
                flexDirection: 'column',
                height: 'full'
              })}>
                <div className={flex({
                  flexDir: 'column'
                })}>

                  <span className={css({
                    fontSize: 'xl',
                    fontWeight: 'semibold',
                    color: 'darkgreen'
                  })}>Pluem AI is your AI Carbon Consultant.</span>
                  <span className={css({
                    fontSize: 'md',
                    color: 'neutral.500'
                  })}>What are you curious about?</span>
                </div>
              </div>
            ) : (
              <div>
                {loaderData.messages.map(message => (
                  <MessageBubble message={message.message} messageType={message.messageType} date={new Date(message.timestamp).toLocaleString()} author={message.authorRole} />
                ))}
              </div>
            )}
            <div className={css({
              width: 'full',
              p: 4
            })}>
              <div className={css({
                position: 'relative',
              })}>
                <input className={css({
                  borderColor: 'darkgreen',
                  borderWidth: 2,
                  p: 2,
                  border: 'solid',
                  boxShadow: 'md',
                  shadowColor: 'darkgreen',
                  rounded: 'md',
                  width: 'full',
                  ring: 'none'
                })} placeholder='Ask Pluem' />
                <div className={flex({
                  position: 'absolute',
                  w: 7,
                  h: 7,
                  justifyContent: 'center',
                  alignItems: 'center',
                  bg: 'darkgreen',
                  rounded: 'full',
                  color: 'white',
                  top: '14%',
                  right: 3,
                  cursor: 'pointer'
                })}>
                  < ArrowUp size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </PanelGroup >
  )
}
