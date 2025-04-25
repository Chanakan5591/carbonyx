import { css } from "carbonyxation/css";
import { flex, hstack, vstack } from "carbonyxation/patterns";
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { ArrowUp, Clock, Plus, Trash, PencilLine } from "lucide-react";
import { button } from "~/components/button";
import { useEffect, useRef, useState } from "react";
import { NotebookItem } from "~/components/notebookitem";
import type { Route } from "./+types/pluem-ai";
import { db, pluem_messages } from "~/db/db";
import { notebook, type Notebook } from "~/db/schema";
import { getAuth } from "@clerk/react-router/ssr.server";
import { eq, and } from 'drizzle-orm'
import { redirect } from 'react-router'
import { MessageBubble } from "~/components/messagebubble";
import { micromark } from 'micromark'

import { gfmHtml, gfm } from 'micromark-extension-gfm'

import { useChat } from '@ai-sdk/react'

import { useFloating, useHover, useFocus, useDismiss, useRole, useInteractions, autoUpdate } from '@floating-ui/react'

export async function loader(args: Route.LoaderArgs) {
  const notebookId = args.params.notebookId
  const auth = await getAuth(args)
  const orgId = auth.orgId
  const userId = auth.userId
  if (!orgId || !userId) throw redirect('/')
  const notebooks = await db.select().from(notebook).where(and(eq(notebook.orgId, orgId), eq(notebook.userId, userId)))
  let messages: any[] = []
  let currentNotebook: Notebook | null = null
  if (notebookId) {
    // if user does not have access to this specific notebook in the first place, deny them
    if (notebooks.filter(notebook => notebook.id === notebookId).length === 0) {
      throw redirect('/dashboard/notebook')
    }
    try {
      messages = (await pluem_messages.get(notebookId)).messages
    } catch (ex) {
      messages = []
    }
    currentNotebook = notebooks.filter(notebook => notebook.id === notebookId)[0]
  }
  return { notebooks, currentNotebook, messages }
}

export async function action(args: Route.ActionArgs) {
  const newId = crypto.randomUUID()
  const auth = await getAuth(args)
  const orgId = auth.orgId
  const userId = auth.userId

  if (!orgId || !userId) throw redirect('/')

  await db.insert(notebook).values({
    id: newId,
    userId,
    orgId,
    timestamp: new Date().getTime(),
    name: `New Notebook ${new Date().toLocaleDateString()}`
  })

  return redirect(`/dashboard/notebook/${newId}`)
}

export default function PluemAI({ loaderData }: Route.ComponentProps) {
  const [emptyConvo, setEmptyConvo] = useState(true)
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    id: loaderData.currentNotebook?.id,
    initialMessages: loaderData.messages,
    sendExtraMessageFields: true
  })
  const messageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef(null);
  const [isActionToolTipOpen, setIsActionToolTipOpen] = useState(false)

  const { refs: actionToolTipRefs, floatingStyles, context } = useFloating({
    open: isActionToolTipOpen,
    onOpenChange: setIsActionToolTipOpen,
    whileElementsMounted: autoUpdate
  })

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, {
    // If your reference element has its own label (text).
    role: 'tooltip',
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  // Scroll to the bottom of the messages container whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Dependency array includes messages to trigger the effect on change

  useEffect(() => {
    if (messages.length === 0) {
      setEmptyConvo(true)
    } else {
      setEmptyConvo(false)
    }
  }, [messages])

  const micromarkOpts = {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()]
  }

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
                <form method="POST">
                  <button type='submit' className={flex({
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgColor: 'primary.400',
                    color: 'white',
                    h: 6,
                    w: 6,
                    rounded: 'full',
                    cursor: 'pointer'
                  })}><Plus size={18} /></button>
                </form>
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
                overflowY: 'auto'
              })}>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </Panel >
      <PanelResizeHandle className={css({
        borderColor: "black",
        borderWidth: .5
      })} />
      <Panel defaultSize={70}>
        <div className={css({
          height: '100%',
          width: '100%',
          padding: 4,
        })}>
          <div className={flex({
            flexDir: 'column',
            justifyContent: 'space-between',
            height: '100%',
            width: '100%',
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
                })} aria-describedby="action-tooltip" ref={actionToolTipRefs.setReference} {...getReferenceProps()}>Action</button>
                <div id="action-tooltip" className={css({
                  bg: 'neutral.200',
                  p: 1,
                  zIndex: 10,
                  mt: 2,
                  rounded: 'md'
                })} role="tooltip" ref={actionToolTipRefs.setFloating} style={floatingStyles} {...getFloatingProps()}>
                  <div className={hstack({
                    gap: 1,
                    px: 4,
                    py: 2,
                    rounded: 'md',
                    cursor: 'pointer',
                    color: 'red.700',
                    _hover: {
                      bg: 'red.200'
                    }
                  })}>
                    <Trash size={18} /> Delete
                  </div>
                  <div className={hstack({
                    gap: 1,
                    px: 4,
                    py: 2,
                    rounded: 'md',
                    cursor: 'pointer',
                    _hover: {
                      bg: 'accent.50'
                    }
                  })}>
                    <PencilLine size={18} /> Rename
                  </div>
                </div>
              </div>
            )}
            <div className={flex({
              flexDir: 'column',
              position: 'relative',
              bg: 'white',
              height: '100%',
              width: '100%',
              rounded: '2xl',
              border: 'solid',
              borderWidth: '1',
              borderColor: 'black',
              overflowY: 'auto',
              maxWidth: '100%'
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
                  {/*                   {loaderData.messages.map(message => (
                    <MessageBubble key={message.id} message={message.message} messageType={message.messageType} date={new Date(message.timestamp).toLocaleString()} author={message.authorRole} />
                  ))} */}
                  {messages.map(message => (
                    <>
                      {message.parts.map((part, i) => {
                        switch (part.type) {
                          case 'text':
                            return <MessageBubble key={`${message.id}-${i}`} message={micromark(part.text, micromarkOpts)} messageType='plain' date={message.createdAt!.toLocaleString()} author={message.role} />
                        }
                      })}
                    </>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
              <div className={css({
                width: 'full',
                p: 4,
                position: 'sticky',
                bottom: 0,
                backgroundColor: 'white', // Add background color to hide content scrolling underneath
                zIndex: 10, // Ensure it stays on top of other content
                borderTop: '1px solid rgba(0, 0, 0, 0.1)', // Optional: adds a subtle separator
                marginTop: 'auto'
              })}>
                <div className={css({
                  position: 'relative',
                })}>
                  <form onSubmit={handleSubmit}>
                    <input onChange={handleInputChange} ref={messageInputRef} className={css({
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
                    <button type='submit' onClick={() => messageInputRef.current!.value = ""} className={flex({
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
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </PanelGroup >
  )
}
