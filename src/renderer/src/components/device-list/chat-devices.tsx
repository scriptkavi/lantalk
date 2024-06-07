import { MonitorSmartphone, Search } from 'lucide-react'
import { FC, ReactNode, useContext, useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { AppContext } from '@renderer/context/app-context'
import { cn } from '@renderer/lib/utils'
import { DeviceType } from '@renderer/types/devicetype'

const ChatDevices: FC = () => {
  const { chatDevices, selectedDevice, setSelectedDevice, myAddress, setChatDevices } =
    useContext(AppContext)

  const [devicesList, setDevicesList] = useState(chatDevices)
  const [searchString, setSearchString] = useState('')

  useEffect(() => {
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
    return
  }, [myAddress])

  useEffect(() => {
    if (searchString) {
      const devices = chatDevices.filter((dev) => dev.mac.includes(searchString))
      setDevicesList([...devices])
    } else {
      setDevicesList([...chatDevices])
    }
  }, [searchString])

  const renderDevices: () => ReactNode[] = () => {
    return devicesList.map((device) => {
      return (
        <div
          className={cn(
            'px-2 h-12 border-b cursor-pointer flex items-center space-x-2 justify-between w-full',
            device.mac === selectedDevice?.mac ? ' bg-secondary' : ''
          )}
          key={device.ip}
          onClick={() => setSelectedDevice && setSelectedDevice(device)}
        >
          <div className="flex items-center space-x-2 max-w-[95%]">
            <MonitorSmartphone
              className={cn(
                'min-h-4 min-w-4',
                device['hasNewMessage']
                  ? ' fill-lime-600 stroke-lime-600'
                  : ' fill-none stroke-black'
              )}
            />
            <div className="flex flex-col justify-center max-w-[95%]">
              <span className="text-sm">{device.mac}</span>
              <span className="text-xs text-slate-600 overflow-hidden whitespace-nowrap w-full text-ellipsis">
                {device.content}
              </span>
            </div>
          </div>
          {device.mac === myAddress?.mac ? (
            <div className="text-xs font-bold text-lime-600">Current</div>
          ) : null}
        </div>
      )
    })
  }
  return (
    <>
      <div className="h-10 border-b flex items-center px-2 py-4">
        <div className="flex items-center w-full px-2 rounded-md">
          <Search className=" w-4 h-4" />
          <Input
            placeholder="Search"
            className="h-8 flex-1 border-none focus-visible:ring-0"
            onChange={(e) => setSearchString(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-auto h-[calc(100%-8.5rem)]">{renderDevices()}</div>
    </>
  )
}

export default ChatDevices
