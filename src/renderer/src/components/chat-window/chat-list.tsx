/* eslint-disable react/prop-types */
import { AppContext } from '@renderer/context/app-context'
import { cn } from '@renderer/lib/utils'
import { HardDriveDownload, HardDriveUpload } from 'lucide-react'
import { ReactNode, useContext, useEffect, useRef } from 'react'
import dayjs from 'dayjs'

const ChatList: ({ messages }) => ReactNode = ({ messages }) => {
  const { myAddress } = useContext(AppContext)
  const chatParentDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatParentDivRef.current) {
      chatParentDivRef.current.scrollTop = chatParentDivRef.current.scrollHeight
    }
  }, [messages])

  const renderMessages: () => ReactNode[] | null = () => {
    if (messages) {
      return messages.map((message) => {
        if (message) {
          return (
            <div
              key={message.id}
              className={cn(
                'items-start mb-4 mt-2',
                message.fromMac === myAddress?.mac ? 'flex flex-row-reverse' : 'flex'
              )}
            >
              <div
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center text-white',
                  message.fromMac === myAddress?.mac ? 'ml-2 bg-primary' : 'mr-2 bg-muted'
                )}
              >
                {message.fromMac === myAddress?.mac ? (
                  <HardDriveUpload className="w-4 h-4" />
                ) : (
                  <HardDriveDownload className="w-4 h-4 text-black" />
                )}
              </div>
              <div
                className={cn(
                  'flex w-max min-w-[25%] max-w-[75%] flex-col gap-1 rounded-lg px-4 py-2 text-sm shadow-md',
                  message.fromMac === myAddress?.mac
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div className="text-base">{message.content}</div>
                <div className="text-[0.7rem] font-semibold">
                  {dayjs(message.sentAt).format('ddd • MMM D, YYYY')}
                </div>
              </div>
            </div>
          )
        }
        return null
      })
    }

    return null
  }

  return (
    <div className="flex-1 h-[calc(100vh-7rem)] overflow-auto p-2 chat-list" ref={chatParentDivRef}>
      {renderMessages()}
    </div>
  )
}

export default ChatList
