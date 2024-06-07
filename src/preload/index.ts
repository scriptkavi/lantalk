/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IChat } from '../main/db-setup'

// Custom APIs for renderer
export type LanTalkApiType = {
  getConnectedNetworkDevices: () => void
  onNetworkDeviceGet: (callback: (value: any) => void) => void
  onNewMessage: (callback: (value: any) => void) => void
  sendMessageToDevice: (chat: IChat) => any
  getMyAddress: () => any
  readDeviceMessages: (macaddr: string) => any
  removeListener: (channel: string) => void
  getChatDevices: () => any
  openDbFolder: () => void
  factoryReset: () => any
}
const LanTalkApi: LanTalkApiType = {
  getConnectedNetworkDevices: () => electronAPI.ipcRenderer.send('getConnectedNetworkDevices'),
  onNetworkDeviceGet: (callback) =>
    electronAPI.ipcRenderer.on('activeNetworkDeviceList', (_event, value) => callback(value)),
  removeListener: (channel: string) => electronAPI.ipcRenderer.removeAllListeners(channel),
  onNewMessage: (callback) =>
    electronAPI.ipcRenderer.on('newMessage', (_event, value) => callback(value)),
  sendMessageToDevice: (chat) => electronAPI.ipcRenderer.invoke('sendMessageToDevice', chat),
  getMyAddress: () => electronAPI.ipcRenderer.invoke('getMyAddress'),
  readDeviceMessages: (macaddr) => electronAPI.ipcRenderer.invoke('readDeviceMessages', macaddr),
  getChatDevices: () => electronAPI.ipcRenderer.invoke('getChatDevices'),
  openDbFolder: () => electronAPI.ipcRenderer.invoke('openDbFolder'),
  factoryReset: () => electronAPI.ipcRenderer.invoke('factoryReset')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('LanTalk', LanTalkApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
