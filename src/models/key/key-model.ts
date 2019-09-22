import { ModelFactory } from 'meseret'

import { keyPaths } from './key-paths'
import { keyStatics } from './key-statics'

export type IKeyPurpose = 'PASSWORD_RESET'
export const keyPurposes: IKeyPurpose[] = ['PASSWORD_RESET']

export interface IKey {
  _at?: Date | number

  purpose: IKeyPurpose
  email?: string
  randomKey: string
  expiry?: Date
}

export const keyModelFactory = new ModelFactory<IKey, {}, typeof keyStatics>({
  name: 'key',
  paths: keyPaths,
  statics: keyStatics
})

export const KeySchema = keyModelFactory.schema
KeySchema.index({
  _at: -1,
  purpose: true,
  email: true
})

export const KeyModel = keyModelFactory.model
