export type DeviceType = {
  name: string
  ip: string
  mac: string
  status: string
  hasNewMessage?: boolean
  content?: string
}

export type MyAddressType = {
  devicename: string
  ip: string
  mac: string
} | null
