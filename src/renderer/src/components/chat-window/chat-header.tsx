import { AppContext } from '@renderer/context/app-context'
import { ReactNode, useContext } from 'react'

const ChatHeader: () => ReactNode = () => {
  const { selectedDevice } = useContext(AppContext)
  return (
    <div className="h-14 border-b px-2 flex items-center font-semibold">{selectedDevice?.mac}</div>
  )
}

export default ChatHeader
