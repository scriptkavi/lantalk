/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sqlite3 from 'sqlite3'
import { app } from 'electron'
import * as path from 'node:path'
const sqlite = sqlite3.verbose()
import * as fs from 'node:fs/promises'
import { constants } from 'node:fs'

export interface IChat {
  id?: number
  fromMac: string
  fromIp: string
  toMac: string
  toIp: string
  content: string
  contentType: string
  status: string
  sentAt?: number
  deliveredAt?: number
  readAt?: number
}

export type ResponseType = {
  success: boolean
  error: any
  data: any
}

export class DbInit {
  #db: any
  constructor() {
    this.#db = null
    this.#initDb()
  }

  async #initDb() {
    const dataPath = app.getPath('userData')
    const folderPath = path.join(dataPath, `chats`)
    const dbFilePath = path.join(folderPath, `userchat.db`)
    const folderavailability = await this.#ensureDirectoryExists(folderPath)
    const dbavailability = await this.#ensureFileExists(dbFilePath)
    if (folderavailability && dbavailability) {
      this.#connectDb(dbFilePath)
    }
  }

  async #ensureDirectoryExists(folderPath: string): Promise<boolean> {
    try {
      await fs.stat(folderPath)
      return true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await fs.mkdir(folderPath, { recursive: true })
        console.log('chats folder created')
        return true
      } else {
        console.error(`Error checking directory: ${(error as Error).message}`)
        return false
      }
    }
  }

  async #ensureFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, constants.F_OK)
      return true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        try {
          await fs.writeFile(filePath, '')
          console.log('File created')
          return true
        } catch (writeError) {
          console.error(`Error creating file: ${(writeError as Error).message}`)
          return false
        }
      } else {
        console.error(`Error checking file: ${(error as Error).message}`)
        return false
      }
    }
  }

  #connectDb(dbFilePath: string) {
    this.#db = new sqlite.Database(dbFilePath, (err) => {
      if (err) {
        console.error('Could not connect to database', err)
      } else {
        console.log('Connected to database')
        this.#db.run(
          `CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY,
            fromMac TEXT NOT NULL,
            fromIp TEXT,
            toMac TEXT NOT NULL,
            toIp TEXT,
            content TEXT NOT NULL,
            contentType TEXT,
            status TEXT,
            sentAt INTEGER NOT NULL,
            deliveredAt INTEGER,
            readAt INTEGER,
            CHECK (status IN ('sent', 'delivered', 'read'))
          );
          
          CREATE INDEX idx_fromMac ON chats(fromMac);
          CREATE INDEX idx_toMac ON chats(toMac);
          CREATE INDEX idx_sentAt ON chats(sentAt);`,
          (err) => {
            if (err) {
              console.error('Could not create table', err)
            }
          }
        )
      }
    })
  }

  closeDb() {
    if (this.#db) {
      this.#db.close((err) => {
        if (err) {
          console.error('Error closing database', err)
        } else {
          console.log('Database connection closed')
        }
      })
    }
  }

  getDbInstance() {
    return this.#db
  }

  insertChat(chat: IChat): Promise<ResponseType> {
    return new Promise((resolve, reject) => {
      this.#db.run(
        `INSERT INTO chats (fromMac, fromIp, toMac, toIp, content, contentType, status, sentAt, deliveredAt, readAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          chat.fromMac,
          chat.fromIp,
          chat.toMac,
          chat.toIp,
          chat.content,
          chat.contentType,
          chat.status,
          chat.sentAt,
          chat.deliveredAt,
          chat.readAt
        ],
        function (err) {
          if (err) {
            console.log(err)
            reject({ success: false, error: err, data: null })
          } else {
            resolve({ success: true, error: null, data: chat })
          }
        }
      )
    })
  }

  deleteChat(id: number): Promise<ResponseType> {
    return new Promise((resolve, reject) => {
      this.#db.run(`DELETE FROM chats WHERE id = ?`, [id], function (err) {
        if (err) {
          reject({ success: false, error: err, data: null })
        } else {
          resolve({ success: true, error: null, data: 'Deleted successfully' })
        }
      })
    })
  }

  getDeviceChat(mac: string): Promise<ResponseType> {
    return new Promise((resolve, reject) => {
      this.#db.all(
        `SELECT * FROM chats WHERE fromMac = ? OR toMac = ?`,
        [mac, mac],
        (err, rows) => {
          if (err) {
            reject({ success: false, error: err, data: null })
          } else {
            resolve({ success: true, error: null, data: rows })
          }
        }
      )
    })
  }

  getLastChatForEachUser(): Promise<ResponseType> {
    return new Promise((resolve, reject) => {
      this.#db.all(
        `
        SELECT c1.*
      FROM chats c1
      INNER JOIN (
        SELECT userMac, MAX(sentAt) AS maxSentAt
        FROM (
          SELECT fromMac AS userMac, sentAt
          FROM chats
          UNION ALL
          SELECT toMac AS userMac, sentAt
          FROM chats
        ) sub
        GROUP BY userMac
      ) c2 ON (c1.fromMac = c2.userMac AND c1.sentAt = c2.maxSentAt)
      OR (c1.toMac = c2.userMac AND c1.sentAt = c2.maxSentAt)
      GROUP BY c1.id
      `,
        (err, rows) => {
          if (err) {
            reject({ success: false, error: err, data: null })
          } else {
            console.log('get chat', rows)
            resolve({ success: true, error: null, data: rows })
          }
        }
      )
    })
  }

  deleteAllChats(): Promise<ResponseType> {
    return new Promise((resolve, reject) => {
      this.#db.run(
        `
        DELETE FROM chats;
        `,
        (err) => {
          if (err) {
            reject({ success: false, error: err, data: null })
          } else {
            resolve({ success: true, error: null, data: null })
          }
        }
      )
    })
  }

  recreateDB(): Promise<ResponseType> {
    return new Promise((resolve, reject) => {
      const dataPath = app.getPath('userData')
      const folderPath = path.join(dataPath, `chats`)
      fs.rm(folderPath, { recursive: true, force: true })
        .then(() => {
          console.log(`${folderPath} is deleted!`)
          this.#initDb()
          resolve({ success: true, error: null, data: null })
        })
        .catch((err) => {
          reject({ success: false, error: err, data: null })
        })
    })
  }
}
