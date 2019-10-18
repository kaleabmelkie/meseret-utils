import { ModelFactory } from 'meseret'

import { keyPaths } from './key-paths'
import { keyStatics } from './key-statics'
import { getMeseretUtilsPreState } from '../../pre-state'

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
