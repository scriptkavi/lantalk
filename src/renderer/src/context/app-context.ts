import { DeviceType, MyAddressType } from '@renderer/types/devicetype'
import { createContext } from 'react'

const defaultValue: {
  myAddress: MyAddressType
  networkDevices: { [x: string]: DeviceType }
  setNetworkDevices: React.Dispatch<
    React.SetStateAction<{
      [x: string]: DeviceType
    }>
  > | null
  chatDevices: DeviceType[]
  setChatDevices: React.Dispatch<React.SetStateAction<DeviceType[]>> | null
  selectedDevice: DeviceType | null
  setSelectedDevice: React.Dispatch<React.SetStateAction<DeviceType | null>> | null
} = {
  myAddress: null,
  networkDevices: {},
  setNetworkDevices: null,
  selectedDevice: null,
  setSelectedDevice: null,
  chatDevices: [],
  setChatDevices: null
}
export const AppContext = createContext(defaultValue)
export const AppProvider = AppContext.Provider
