import { ServerApp } from 'meseret'

import { KoaError } from './lib/koa-error/koa-error'

export type IMeseretUtilsState =
  | { _configured: false }
  | { _configured: true } & IMeseretUtilsConfiguration

export type IMeseretUtilsConfiguration = {
  serverApp: ServerApp
}

const globalState: IMeseretUtilsState = { _configured: false }

export function configureMeseretUtils(
  configuration: IMeseretUtilsConfiguration
) {
  Object.setPrototypeOf(globalState, {
    _initiated: true,
    ...configuration
  })
}

export function getMeseretUtilsState(): IMeseretUtilsConfiguration {
  const { _configured, ...config } = globalState

  if (_configured) {
    throw new KoaError(
      '"meseret-utils" is not configured.',
      500,
      'NOT_CONFIGURED'
    )
  }

  return { ...config } as IMeseretUtilsConfiguration
}
