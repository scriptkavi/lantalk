/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Send } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ReactNode, useContext, useState } from 'react'
import { AppContext } from '@renderer/context/app-context'
import { IChat } from '@renderer/App'

const ChatFooter: ({
  setMessages
}: {
  setMessages: React.Dispatch<React.SetStateAction<any[]>>
}) => ReactNode = ({ setMessages }) => {
  const { myAddress, selectedDevice } = useContext(AppContext)
  const [inputText, setInputText] = useState('')

  const sendMessage: () => void = () => {
    if (selectedDevice?.ip && inputText && myAddress) {
      const chat: IChat = {
        fromMac: myAddress.mac,
        fromIp: myAddress?.ip,
        toMac: selectedDevice.mac,
        toIp: selectedDevice.ip,
        content: inputText,
        contentType: 'text',
        status: 'sent'
      }
      window.LanTalk.sendMessageToDevice(chat).then((res) => {
        if (res) {
          setInputText('')
          setMessages((prevValue) => {
            const msgs = [...prevValue]
            msgs.push(res)
            return msgs
          })
        }
      })
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="h-16 border-t px-2 flex items-center space-x-2">
      <Input
        placeholder="Type your message..."
        onChange={(e) => setInputText(e.target.value || '')}
        onKeyPress={handleKeyPress}
        value={inputText}
        className="focus-visible:ring-0"
      />
      <Button type="submit" size="icon" disabled={inputText.length === 0} onClick={sendMessage}>
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  )
}

export default ChatFooter
