import { ModelFactory } from 'meseret'
import { ClientSession, Document, SchemaDefinition } from 'mongoose'
import { randomBytes } from 'crypto'

import { getMeseretUtilsPreState } from '../pre-state'
import { KoaError } from '../lib/koa-error/koa-error'
import { add } from '../lib/crud/crud'

// todo: enumerate...
export type IKeyPurpose = 'PASSWORD_RESET'
export const keyPurposes: IKeyPurpose[] = ['PASSWORD_RESET']

export interface IKey {
  _at?: Date | number

  purpose: IKeyPurpose
  email?: string
  randomKey: string
  expiry?: Date
}

export const keyPaths: SchemaDefinition = {
  _at: { type: Date, default: Date.now },

  purpose: { type: String, required: true, enum: keyPurposes },
  email: { type: String },
  randomKey: { type: String, required: true },
  expiry: {
    type: Date,
    required: true,
    default: () => {
      return Date.now() + 1000 * 60 * 60
    }
  }
}

export const keyStatics = {
  async cleanup({ session }: { session?: ClientSession } = {}): Promise<void> {
    await KeyModel.findOneAndRemove({ expiry: { $lt: Date.now() } }).session(
      session || null
    )
  },

  async add(
    purpose: IKeyPurpose,
    email: string,
    length = 64,
    expiry?: Date,
    { session }: { session?: ClientSession } = {}
  ): Promise<string> {
    await this.cleanup({ session })

    const data: IKey = new KeyModel({
      purpose,
      email,
      randomKey: randomBytes(length).toString('hex'),
      expiry
    })
    return (await add(KeyModel, data, { session })).randomKey
  },

  async match(
    purpose: IKeyPurpose,
    email: string,
    randomKey: string,
    { session }: { session?: ClientSession } = {}
  ): Promise<boolean> {
    await this.cleanup({ session })

    if (!purpose)
      throw new KoaError('"purpose" parameter not found.', 500, 'NO_PURPOSE')
    if (!email)
      throw new KoaError('"email" parameter not found.', 400, 'NO_EMAIL')
    if (!randomKey)
      throw new KoaError(
        '"randomKey" parameter not found.',
        400,
        'NO_RANDOM_KEY'
      )

    return !!(await KeyModel.findOne({ purpose, randomKey, email }).session(
      session || null
    ))
  },

  async delete(
    randomKey: string,
    { session }: { session?: ClientSession } = {}
  ): Promise<void> {
    await KeyModel.cleanup({ session })

    if (!randomKey)
      throw new KoaError(
        '"randomKey" parameter not found.',
        400,
        'RANDOM_KEY_INVALID'
      )

    await KeyModel.findOneAndRemove({ randomKey }).session(session || null)
  }
}

export type KeyDocumentType = Document & IKey

export const keyModelFactory = new ModelFactory<IKey, {}, typeof keyStatics>({
  mongooseInstance: getMeseretUtilsPreState().mongooseInstance,
  name: 'key',
  paths: keyPaths,
  statics: keyStatics
})

export const keySchema = keyModelFactory.schema

export const KeyModel = keyModelFactory.model

KeyModel.collection
  .createIndex({
    _at: -1,
    purpose: 1,
    email: 1
  })
  .catch(console.error)
