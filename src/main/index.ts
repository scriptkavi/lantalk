/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
// import { autoUpdater } from 'electron-updater'
import { join } from 'node:path'
import { electronApp, optimizer, is, platform } from '@electron-toolkit/utils'

import icon from '../../resources/icon.png?asset'

import { getMyAddress, openDbFolder } from './util'
import { factoryReset, getConnectedNetworkDevices, sendMessageToRemoteDevice } from './model'
import { connectUDPServer, server } from './udp-connector'
import { DbInit, IChat, ResponseType } from './db-setup'
import { autoUpdater } from 'electron-updater'
// import log from 'electron-log/main';

// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = "info";

let db: DbInit | null = null

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 20 },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  db = new DbInit()

  // ipc connections
  ipcMain.on('getConnectedNetworkDevices', async (_event) => {
    getConnectedNetworkDevices(mainWindow)
  })

  connectUDPServer(mainWindow)

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update available',
      message: 'A new update is available. Downloading now...'
    })
  })

  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update ready',
        message: 'A new update is ready. It will be installed on restart.'
      })
      .then(() => {
        autoUpdater.quitAndInstall()
      })
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils

  // app.name = 'LanTalk'
  // if (platform.isMacOS) {
  //   const image = path.join(__dirname, '../../build', 'icon.png')
  //   app.dock.setIcon(image)
  //   app.dock.setBadge('LanTalk')
  // }

  if (platform.isMacOS || platform.isWindows) {
    electronApp.setAutoLaunch(true)
  }

  // console.log('image', image.toDataURL())
  // app.dock.setBadge('LanTalk')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Invoke listeners
  ipcMain.handle('getMyAddress', getMyAddress)

  ipcMain.handle('readDeviceMessages', async (_event, macaddr: string) => {
    if (db) {
      const response: ResponseType = await db.getDeviceChat(macaddr)
      if (response.success) {
        return response.data
      }
    }
  })

  ipcMain.handle('getChatDevices', async (_event) => {
    if (db) {
      const response: ResponseType = await db.getLastChatForEachUser()
      if (response.success) {
        return response.data
      }
      return []
    }
    return []
  })

  ipcMain.handle('sendMessageToDevice', (_event, chat: IChat) => {
    return sendMessageToRemoteDevice(chat, db)
  })

  ipcMain.handle('openDbFolder', (_event) => {
    openDbFolder()
  })

  ipcMain.handle('factoryReset', (_event) => {
    factoryReset(db)
      ?.then(() => {
        app.relaunch()
        app.exit()
        return 'Successful'
      })
      .catch((err) => {
        console.log(err)
        return err
      })
  })

  // OnStart
  // createChatFolderIfNotExist()
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  console.log('window-all-closed')
  if (server) {
    server.close()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  console.log('ready')
})

app.on('will-finish-launching', () => {
  console.log('will-finish-launching')
})

app.on('before-quit', () => {
  console.log('before-quit')
})

app.on('will-quit', () => {
  console.log('will-quit')
})

app.on('quit', () => {
  console.log('quit')
  if (server) {
    server.close()
  }
})

app.on('activate', () => {
  console.log('activate')
})

app.on('did-become-active', () => {
  console.log('did-become-active')
})

app.on('did-resign-active', () => {
  console.log('did-resign-active')
})

app.on('continue-activity', () => {
  console.log('continue-activity')
})

app.on('will-continue-activity', () => {
  console.log('will-continue-activity')
})

app.on('continue-activity-error', () => {
  console.log('continue-activity-error')
})

app.on('activity-was-continued', () => {
  console.log('activity-was-continued')
})

app.on('update-activity-state', () => {
  console.log('update-activity-state')
})

app.on('new-window-for-tab', () => {
  console.log('new-window-for-tab')
})

app.on('browser-window-blur', () => {
  console.log('browser-window-blur')
})

app.on('browser-window-focus', () => {
  console.log('browser-window-focus')
})

app.on('browser-window-created', () => {
  console.log('browser-window-created')
})

app.on('web-contents-created', () => {
  console.log('web-contents-created')
})

app.on('render-process-gone', () => {
  console.log('render-process-gone')
})

app.on('child-process-gone', () => {
  console.log('child-process-gone')
})

app.on('session-created', () => {
  console.log('session-created')
})

app.on('second-instance', () => {
  console.log('second-instance')
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
