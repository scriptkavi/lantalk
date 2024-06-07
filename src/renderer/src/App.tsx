/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// import Versions from './components/Versions'

import { useEffect, useState } from 'react'
import { DeviceType, MyAddressType } from './types/devicetype'
import Header from './components/header'
import { AppProvider } from './context/app-context'
import DeviceList from './components/device-list'
import ChatWindow from './components/chat-window'

export interface IChat {
  id?: number
  fromMac: string
  fromIp: string
  toMac: string
  toIp: string
  content: string
  contentType: string
  status: string
  sentAt?: number
  deliveredAt?: number
  readAt?: number
}

function App(): JSX.Element {
  const [networkDevices, setNetworkDevices] = useState<{ [x: string]: DeviceType }>({})
  const [chatDevices, setChatDevices] = useState<DeviceType[]>([])
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null)

  const [myAddress, setMyAddress] = useState<MyAddressType>(null)

  useEffect(() => {
    const onInit = () => {
      // get my address
      window.LanTalk.getMyAddress().then((res) => {
        setMyAddress(res)
      })
    }
    onInit()
  }, [])

  return (
    <AppProvider
      value={{
        myAddress,
        networkDevices,
        setNetworkDevices,
        selectedDevice,
        setSelectedDevice,
        chatDevices,
        setChatDevices
      }}
    >
      <div className="flex flex-col h-full w-full">
        <Header />
        <div className="main-content h-[calc(100vh-2.5rem)] p-4 -mt-[8.5rem]">
          <div className="border flex h-full bg-white rounded-xl">
            <DeviceList />
            <ChatWindow />
          </div>
        </div>
      </div>
    </AppProvider>
  )
}

export default App
