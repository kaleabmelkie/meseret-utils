import { Schema, Model, Document } from 'mongoose'
import { ServerApp } from 'meseret'
import { Stream } from 'stream'
import * as g from 'gridfs-stream'

import { KoaError } from '../koa-error/koa-error'

type ObjectId = Schema.Types.ObjectId | string

export class Grid {
  constructor(
    private app: ServerApp,
    private model: Model<Document>,
    private _id?: ObjectId,
    private type = model.modelName,
    private checkDocument = true
  ) {
    if (!this._id)
      throw new KoaError('"_id" parameter not found.', 400, 'NO_ID')
  }

  static _checkData(data: Stream): void {
    if (!data) throw new KoaError('"data" parameter not found.', 400, 'NO_DATA')
  }

  async _checkDocument(): Promise<void> {
    if (!this.checkDocument) return

    if (!(await this.model.findById(this._id)))
      throw new KoaError(
        `No document found using _id '${this._id}'.`,
        404,
        'DOCUMENT_NOT_FOUND'
      )
  }

  async _checkFilename(filename: string): Promise<void> {
    if (!(await this.has(filename)))
      throw new KoaError('No file to get.', 404, 'FILE_NOT_FOUND')
  }

  _getPath(filename: string) {
    return `${this.model.modelName.toLowerCase()}/${this._id}/${
      this.type
    }/${filename}`
  }

  get _gfs(): g.Grid {
    const gfs = this.app.grid
    if (!gfs) throw new KoaError('GridFS not available.', 500, 'NO_GRID')

    return gfs
  }

  async add(
    data: Stream,
    filename: string,
    contentType = 'binary/octet-stream'
  ): Promise<void> {
    Grid._checkData(data)
    await this._checkDocument()

    return new Promise<void>((resolve, reject) => {
      const writeStream = this._gfs.createWriteStream({
        filename: this._getPath(filename),
        content_type: contentType
      })
      writeStream.once('finish', () => resolve())
      writeStream.once('error', err =>
        this.remove(filename, false)
          .then(() => reject(err))
          .catch(rmvErr => {
            err.rollbackError = rmvErr
            reject(err)
          })
      )

      data.pipe(writeStream)
    })
  }

  async get(filename = 'default'): Promise<Stream> {
    await this._checkDocument()
    await this._checkFilename(filename)

    return this._gfs.createReadStream({ filename: this._getPath(filename) })
  }

  async getType(filename = 'default'): Promise<string> {
    await this._checkDocument()
    await this._checkFilename(filename)

    return new Promise<string>((resolve, reject) => {
      this._gfs
        .collection()
        .findOne({ filename: this._getPath(filename) }, (err, record) => {
          try {
            err ? reject(err) : resolve(record.contentType)
          } catch (e) {
            reject(e)
          }
        })
    })
  }

  async has(filename = 'default'): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this._gfs.exist({ filename: this._getPath(filename) }, (err, found) =>
        err ? reject(err) : resolve(found)
      )
    })
  }

  async listFilenames(): Promise<string[]> {
    await this._checkDocument()

    const folder = this._getPath('')
    const files = await this._gfs.files
      .find({ filename: new RegExp(`^${folder}`) })
      .toArray()
    return files.map(file => file.filename.replace(folder, ''))
  }

  async set(data: Stream, contentType = 'binary/octet-stream'): Promise<void> {
    Grid._checkData(data)

    await this.remove('default', false)
    return this.add(data, 'default', contentType)
  }

  async remove(
    filename = 'default',
    checkFilename = this.checkDocument
  ): Promise<void> {
    await this._checkDocument()
    if (checkFilename) await this._checkFilename(filename)

    return new Promise<void>((resolve, reject) => {
      this._gfs.remove({ filename: this._getPath(filename) }, err =>
        err ? reject(err) : resolve()
      )
    })
  }
}
