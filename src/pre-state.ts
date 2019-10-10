import mongoose from 'mongoose'
import { KoaError } from './lib/koa-error/koa-error'

export type IMeseretUtilsPreState =
  | { _configured: false }
  | { _configured: true } & IMeseretUtilsPreConfiguration

export type IMeseretUtilsPreConfiguration = {
  mongooseInstance: typeof mongoose
}

const globalPreState: IMeseretUtilsPreState = { _configured: false }

export function preConfigureMeseretUtils(
  configuration: IMeseretUtilsPreConfiguration
) {
  const newGlobalPreState: IMeseretUtilsPreState = {
    _configured: true,
    ...configuration
  }
  Object.assign(globalPreState, newGlobalPreState)
}

export function getMeseretUtilsPreState(): IMeseretUtilsPreConfiguration {
  const { _configured, ...config } = globalPreState

  if (!_configured) {
    throw new KoaError(
      '"meseret-utils" is not pre-configured.',
      500,
      'NOT_PRE_CONFIGURED'
    )
  }

  return { ...config } as IMeseretUtilsPreConfiguration
}
