import { ElectronAPI } from '@electron-toolkit/preload'
import { LanTalkApiType } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    LanTalk: LanTalkApiType
  }
}
