/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as os from 'node:os'
import { Notification } from 'electron/main'
import { app, shell } from 'electron'
import path from 'node:path'

export function getMyAddress() {
  const myAddress = {
    ip: '',
    mac: '',
    devicename: ''
  }
  const targetInterface =
    process.platform === 'win32' ? 'Wi-Fi' : process.platform === 'darwin' ? 'en0' : 'wlp0s20f3'

  const networkDetails = getNetworkDetails(targetInterface)
  if (networkDetails) {
    networkDetails.forEach((detail) => {
      if (detail.family === 'IPv4') {
        myAddress.ip = detail.ip
        myAddress.mac = detail.mac
        myAddress.devicename = os.hostname()
      }
    })
  } else {
    console.log(`No details found for interface ${targetInterface}`)
  }

  return myAddress
}

function getNetworkDetails(interfaceName) {
  const interfaces = os.networkInterfaces()
  const interfaceInfo = interfaces[interfaceName]

  if (interfaceInfo) {
    const details = interfaceInfo.map((addressInfo) => ({
      ip: addressInfo.address,
      mac: addressInfo.mac,
      family: addressInfo.family
    }))
    return details
  }

  return null // Return null if no such interface exists
}

export function showNotification(title: string, body: string) {
  try {
    new Notification({ title: title, body: body }).show()
  } catch (error) {
    console.log(error)
  }
}

export function openDbFolder() {
  const dataPath = app.getPath('userData')
  const dbFilePath = path.join(dataPath, `chats/userchat.db`)
  shell.showItemInFolder(dbFilePath)
}
