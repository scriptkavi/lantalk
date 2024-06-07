/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppContext } from '@renderer/context/app-context'
import { ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { toast } from '../ui/use-toast'
import { ToastAction } from '../ui/toast'
import ChatHeader from './chat-header'
import ChatFooter from './chat-footer'
import ChatList from './chat-list'
import { DeviceType } from '@renderer/types/devicetype'

const ChatWindow: () => ReactNode = () => {
  const {
    selectedDevice,
    networkDevices,
    setNetworkDevices,
    setSelectedDevice,
    myAddress,
    setChatDevices
  } = useContext(AppContext)

  const [messages, setMessages] = useState<any[]>([])
  const [isReadingMessages, setIsReadingMessages] = useState(true)

  const getChatDevices = useCallback(() => {
    if (myAddress) {
      window.LanTalk.getChatDevices().then((res) => {
        const devices: DeviceType[] = res.map((device) => {
          return {
            name: '?',
            ip: device.fromIp === myAddress.ip ? device.toIp : device.fromIp,
            mac: device.fromMac === myAddress.mac ? device.toMac : device.fromMac,
            status: device.status,
            hasNewMessage: false,
            content: device.content
          }
        })
        if (setChatDevices) {
          setChatDevices([...devices])
        }
      })
    }
  }, [myAddress])

  useEffect(() => {
    if (networkDevices) {
      window.LanTalk.onNewMessage((value) => {
        console.log('new Message', value)
        const active_devices = { ...networkDevices }
        if (active_devices[value.fromMac]) {
          active_devices[value.fromMac]['hasNewMessage'] = true
        } else {
          active_devices[value.fromMac] = {
            name: '?',
            ip: value.fromIp,
            mac: value.fromMac,
            status: 'active',
            hasNewMessage: true
          }
        }
        if (setNetworkDevices) {
          setNetworkDevices({ ...active_devices })
        }
        getChatDevices()
        toast({
          title: 'New Message',
          description: `New message from ${value.fromMac}`,
          action: (
            <ToastAction
              altText="View Message"
              onClick={() => setSelectedDevice && setSelectedDevice(networkDevices[value.fromMac])}
            >
              View
            </ToastAction>
          )
        })
      })

      return () => {
        window.LanTalk.removeListener('newMessage')
      }
    }

    return
  }, [networkDevices])

  useEffect(() => {
    if (selectedDevice?.mac) {
      setIsReadingMessages(true)
      setMessages([])
      window.LanTalk.readDeviceMessages(selectedDevice.mac).then((res) => {
        const msgs: any[] = []
        for (const key in res) {
          if (res[key]) {
            msgs.push(res[key])
          }
        }
        setMessages(msgs)
        setIsReadingMessages(false)
      })
    }
  }, [selectedDevice])

  return (
    <div className="flex-1 flex flex-col h-full max-w-[calc(100%-18rem)]">
      <ChatHeader />
      {selectedDevice ? (
        <>
          {isReadingMessages ? (
            <div className="flex-1 h-[calc(100vh-7rem)] overflow-auto p-2 flex items-center justify-center">
              <div className="text-sm font-semibold text-slate-500">Loading messages...</div>
            </div>
          ) : (
            <ChatList messages={messages} />
          )}
          <ChatFooter setMessages={setMessages} />
        </>
      ) : (
        <div className="flex-1 h-[calc(100vh-7rem)] overflow-auto p-2 flex items-center justify-center">
          <div className="text-sm font-semibold text-slate-500">
            Select device to start chatting.
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWindow
