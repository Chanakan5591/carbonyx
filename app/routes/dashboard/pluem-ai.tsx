import { css } from "carbonyxation/css";
import { flex, hstack, vstack } from "carbonyxation/patterns";
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { ArrowUp, Clock, Plus } from "lucide-react";
import { button } from "~/components/button";
import { useEffect, useState } from "react";
import { NotebookItem } from "~/components/notebookitem";
import type { Route } from "./+types/pluem-ai";
import { db } from "~/db/db";
import { notebook, notebookMessage, type Notebook, type NotebookMessage } from "~/db/schema";
import { getAuth } from "@clerk/react-router/ssr.server";
import { eq, and } from 'drizzle-orm'
import { redirect } from 'react-router'
import { MessageBubble } from "~/components/messagebubble";

import { useChat } from '@ai-sdk/react'

export async function loader(args: Route.LoaderArgs) {
  const notebookId = args.params.notebookId
  const auth = await getAuth(args)
  const orgId = auth.orgId
  const userId = auth.userId
  if (!orgId || !userId) throw redirect('/')
  const notebooks = await db.select().from(notebook).where(and(eq(notebook.orgId, orgId), eq(notebook.userId, userId)))
  let messages: NotebookMessage[] = []
  let currentNotebook: Notebook | null = null
  if (notebookId) {
    // if user does not have access to this specific notebook in the first place, deny them
    if (notebooks.filter(notebook => notebook.id === notebookId).length === 0) {
      throw redirect('/dashboard/notebook')
    }
    messages = await db.select().from(notebookMessage).where(and(eq(notebookMessage.notebookId, notebookId)))
    currentNotebook = notebooks.filter(notebook => notebook.id === notebookId)[0]
  }
  return { notebooks, currentNotebook, messages }
}

export default function PluemAI({ loaderData }: Route.ComponentProps) {
  const [emptyConvo, setEmptyConvo] = useState(true)
  const { messages, input, handleInputChange, handleSubmit } = useChat()
  const [convoMessages, setConvoMessages] = useState([])

  useEffect(() => {
    if (loaderData.messages.length === 0) {
      setEmptyConvo(true)
    } else {
      setEmptyConvo(false)
    }
  }, [loaderData.messages.length])

  return (
    <PanelGroup direction="horizontal">
      <Panel minSize={30} defaultSize={30} maxSize={50}>
        {/* Nested vertical PanelGroup */}
        <PanelGroup direction="vertical">
          {/* Top panel (notebook list) */}
          <Panel defaultSize={70} minSize={30}>
            <div className={vstack({
              p: 4,
              pt: 3,
              height: 'full'
            })}>
              <div className={hstack({
                gap: 2,
                width: '100%'
              })}>
                <span className={css({
                  fontSize: 16,
                  fontWeight: 'semibold'
                })}>My Notebooks</span>
                <button className={flex({
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgColor: 'primary.400',
                  color: 'white',
                  h: 6,
                  w: 6,
                  rounded: 'full',
                  cursor: 'pointer'
                })}><Plus size={18} /></button>
              </div>
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
                  <NotebookItem key={notebook.id} title={notebook.name} date={new Date(notebook.timestamp).toLocaleString()} notebookId={notebook.id} />
                ))}
              </div>
            </div>
          </Panel>
          {/* Vertical resize handle */}
          <PanelResizeHandle className={css({
            borderColor: "black",
            borderWidth: .5,
            backgroundColor: '#f0f0f0',
            cursor: 'row-resize'
          })} />
          {/* Bottom panel (new panel) */}
          <Panel defaultSize={30} minSize={20}>
            <div className={vstack({
              p: 4,
              height: 'full',
              width: 'full'
            })}>
              <div className={hstack({
                gap: 2,
                width: '100%'
              })}>
                <span className={css({
                  fontSize: 16,
                  fontWeight: 'semibold'
                })}>Shared Notebooks</span>
              </div>
              {/* New panel content goes here */}
              <div className={css({
                bgColor: 'white',
                borderColor: 'black',
                border: 'solid',
                borderWidth: 1,
                rounded: '2xl',
                height: 'full',
                width: 'full',
                p: 3,
                overflow: 'auto'
              })}>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </Panel>
      <PanelResizeHandle className={css({
        borderColor: "black",
        borderWidth: .5
      })} />
      <Panel defaultSize={70}>
        <div className={css({
          height: '100%',
          width: '100%',
          padding: 4
        })}>
          <div className={flex({
            flexDir: 'column',
            justifyContent: 'space-between',
            height: '100%',
            width: '100%',
            overflow: 'auto',
            gap: 4
          })}>
            {!emptyConvo && (
              <div className={hstack({
                justifyContent: 'space-between'
              })}>
                <div className={flex({
                  flexDir: 'column'
                })}>
                  <span className={css({
                    fontSize: 24,
                    fontWeight: 'semibold'
                  })}>{loaderData.currentNotebook?.name}</span>
                  <span className={flex({ gap: 2, alignItems: 'center' })}><Clock size={18} /> Created: {new Date(loaderData.currentNotebook!.timestamp).toLocaleString()}</span>
                </div>
                <button className={button({
                  variant: 'solid',
                  color: 'accent'
                })}>Action</button>
              </div>
            )}
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
                    <MessageBubble key={message.id} message={message.message} messageType={message.messageType} date={new Date(message.timestamp).toLocaleString()} author={message.authorRole} />
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
                    ring: 'none',
                    _placeholder: {
                      fontStyle: 'italic'
                    }
                  })} placeholder='Ask Pluem...' />
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
                    <ArrowUp size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </PanelGroup>
  )
}
