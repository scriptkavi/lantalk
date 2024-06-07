import { MonitorSmartphone, Radar } from 'lucide-react'
import { Button } from '../ui/button'
import { ReactNode, useContext, useState } from 'react'
import { AppContext } from '@renderer/context/app-context'
import { cn } from '@renderer/lib/utils'
import ChatDevices from './chat-devices'
import NetworkDevices from './network-devices'
import NewChat from './new-chat'

const DeviceList: () => ReactNode = () => {
  const { myAddress } = useContext(AppContext)
  const [isScanning, setIsScanning] = useState(true)
  const [activeTab, setActiveTab] = useState('chats')

  const scanDevices: () => void = () => {
    setIsScanning(true)
    window.LanTalk.getConnectedNetworkDevices()
  }

  return (
    <div className="w-72 flex flex-col border-r h-full">
      <div className="h-14 border-b flex items-center px-2 py-4">
        <div className="flex items-center flex-1 space-x-2">
          <div>
            <MonitorSmartphone className="h-8 w-8 stroke-primary" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-sm font-bold">{myAddress?.mac}</div>
            <div className="text-xs font-semibold text-slate-600">{myAddress?.ip}</div>
          </div>
        </div>
        <div>
          <NewChat />
        </div>
      </div>

      <div className="h-10 border-b flex items-center px-2 py-4 space-x-2">
        <div className="flex items-center flex-1 space-x-2">
          <Button
            className="h-6 rounded-full text-xs"
            variant={activeTab === 'chats' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('chats')}
          >
            Chats
          </Button>
          <Button
            className="h-6 rounded-full text-xs"
            variant={activeTab === 'network' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('network')}
          >
            Network
          </Button>
        </div>
        {activeTab === 'network' ? (
          <div className="flex items-center">
            <Button className="h-6 w-6 rounded-full text-xs" size="icon" onClick={scanDevices}>
              <Radar className={cn('w-5 h-5', isScanning ? 'animate-spin' : '')} />
            </Button>
          </div>
        ) : null}
      </div>
      {activeTab === 'chats' ? (
        <ChatDevices />
      ) : (
        <NetworkDevices isScanning={isScanning} setIsScanning={setIsScanning} />
      )}
    </div>
  )
}

export default DeviceList
