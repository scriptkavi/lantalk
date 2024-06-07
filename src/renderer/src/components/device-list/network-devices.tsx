/* eslint-disable react/prop-types */
import { AppContext } from '@renderer/context/app-context'
import { cn } from '@renderer/lib/utils'
import { MonitorSmartphone } from 'lucide-react'
import { ReactNode, useContext, useEffect } from 'react'

const NetworkDevices: ({
  isScanning,
  setIsScanning
}: {
  isScanning: boolean
  setIsScanning: React.Dispatch<React.SetStateAction<boolean>>
}) => ReactNode = ({ isScanning, setIsScanning }) => {
  const { networkDevices, setSelectedDevice, myAddress, selectedDevice, setNetworkDevices } =
    useContext(AppContext)

  useEffect(() => {
    if (myAddress) {
      window.LanTalk.getConnectedNetworkDevices()

      window.LanTalk.onNetworkDeviceGet((value) => {
        setIsScanning(false)
        if (setNetworkDevices) {
          setNetworkDevices((prevValue) => {
            const active_devices = { ...prevValue }
            active_devices[value.mac] = { ...value, hasNewMessage: false }
            return active_devices
          })
        }
      })

      return () => {
        window.LanTalk.removeListener('activeNetworkDeviceList')
      }
    }
    return
  }, [myAddress])

  const renderDevices: () => ReactNode[] = () => {
    return Object.keys(networkDevices)
      .sort()
      .map((devicemac: string) => {
        if (networkDevices[devicemac].mac !== myAddress?.mac) {
          return (
            <div
              className={cn(
                'px-2 h-12 border-b cursor-pointer flex items-center space-x-2 justify-between',
                networkDevices[devicemac].mac === selectedDevice?.mac ? ' bg-secondary' : ''
              )}
              key={networkDevices[devicemac].ip}
              onClick={() => setSelectedDevice && setSelectedDevice(networkDevices[devicemac])}
            >
              <div className="flex items-center space-x-2">
                <MonitorSmartphone
                  className={cn(
                    'h-4 w-4',
                    networkDevices[devicemac]['hasNewMessage']
                      ? ' fill-lime-600 stroke-lime-600'
                      : ' fill-none stroke-black'
                  )}
                />
                <div className="flex flex-col justify-center">
                  <span className="text-sm">{networkDevices[devicemac].mac}</span>
                  <span className="text-xs text-slate-600">{networkDevices[devicemac].ip}</span>
                </div>
              </div>
            </div>
          )
        }
      })
  }

  return (
    <div className="overflow-auto h-[calc(100%-6rem)]">
      {isScanning ? (
        <div className="w-full h-full flex items-center justify-center">Scanning...</div>
      ) : (
        renderDevices()
      )}
    </div>
  )
}

export default NetworkDevices
