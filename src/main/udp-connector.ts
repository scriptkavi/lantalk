/* eslint-disable @typescript-eslint/no-unused-vars */
import dgram from 'node:dgram'
import { showNotification } from './util'
import { DbInit } from './db-setup'
import { MessageType } from './model'

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const server = dgram.createSocket({ type: 'udp4', reuseAddr: true })
const db = new DbInit()
export function connectUDPServer(mainWindow) {
  server.on('error', (err) => {
    console.error(`server error:\n${err.stack}`)
    server.close()
  })

  server.on('message', (incomingMessage) => {
    try {
      console.log('message', incomingMessage.toLocaleString())
      const incoming_message: MessageType = JSON.parse(incomingMessage.toLocaleString())
      if (incoming_message.type === 'user') {
        incoming_message.content.deliveredAt = +new Date()
        db.insertChat(incoming_message.content)
        if (mainWindow) {
          mainWindow.webContents.send('newMessage', incoming_message.content)
        }
        showNotification(
          'LanTalk',
          `You have received message from ${incoming_message.content.fromMac}`
        )
      } else if (incoming_message.type === 'system') {
        if (incoming_message.action === 'setName') {
          const address = incoming_message.content
          console.log(address)
        }
      }
    } catch (error) {
      console.log(error)
    }
  })

  server.on('listening', () => {
    const address = server.address()
    console.log(`server listening ${address.address}:${address.port}`)
  })

  server.bind(41569)
}
