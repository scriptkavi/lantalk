/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import find from 'local-devices'
import ping from 'ping'
import dgram from 'node:dgram'
import { Buffer } from 'node:buffer'
import { app } from 'electron'
import { DbInit, IChat } from './db-setup'

export async function getConnectedNetworkDevices(mainWindow) {
  try {
    console.log('getting connected devices')
    const devices = await find({ skipNameResolution: true })
    console.log('got connected devices')
    for (const i in devices) {
      const host = devices[i].ip
      ping.sys.probe(host, function (isAlive) {
        if (isAlive) {
          mainWindow.webContents.send('activeNetworkDeviceList', {
            ...devices[i],
            status: 'active'
          })
        }
      })
    }
  } catch (error) {
    console.log('Has Error')
    console.log(error)
    app.relaunch()
    app.exit()
  }
}

export type MessageType = {
  type: string
  action: string
  content: any
}

export function sendMessageToRemoteDevice(chat: IChat, db: DbInit | null) {
  chat.id = +new Date()
  chat.sentAt = +new Date()
  chat.deliveredAt = 0
  chat.readAt = 0
  const message = Buffer.from(JSON.stringify({ type: 'user', action: '', content: chat }))
  const client = dgram.createSocket({ type: 'udp4', reuseAddr: true })
  if (db) {
    console.log('inserted chat')
    db.insertChat(chat)
  }
  client.send(message, 41569, chat.toIp, async (_err) => {
    client.close()
  })
  return chat
}

export function factoryReset(db: DbInit | null) {
  if (db) {
    return db.recreateDB()
  }
  return null
}
