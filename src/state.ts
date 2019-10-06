import { Document, Model, ServerApp } from 'meseret'

import { sslRedirect } from './middleware/ssl-redirect/ssl-redirect'
import { KeyModel } from './models/key/key-model'
import { KoaError } from './lib/koa-error/koa-error'

export type IMeseretUtilsState =
  | { _configured: false }
  | { _configured: true } & IMeseretUtilsConfiguration

export type IMeseretUtilsConfiguration = {
  serverApp: ServerApp
  /**
   * @default true
   */
  applySslRedirect?: boolean | string[]
  /**
   * @default true
   */
  addModels?: boolean
}

const globalState: IMeseretUtilsState = { _configured: false }

export function configureMeseretUtils(
  configuration: IMeseretUtilsConfiguration
) {
  const { applySslRedirect = true, addModels = true } = configuration

  if (applySslRedirect) {
    configuration.serverApp.app.use(
      sslRedirect(
        Array.isArray(applySslRedirect) ? applySslRedirect : undefined
      )
    )
  }

  if (addModels) {
    const models: Model<Document>[] = [KeyModel]
    configuration.serverApp.config.models
      ? configuration.serverApp.config.models.push(...models)
      : (configuration.serverApp.config.models = models)
  }

  const newGlobalState: IMeseretUtilsState = {
    _configured: true,
    ...configuration
  }
  Object.setPrototypeOf(globalState, newGlobalState)
}

export function getMeseretUtilsState(): IMeseretUtilsConfiguration {
  const { _configured, ...config } = globalState

  if (!_configured) {
    throw new KoaError(
      '"meseret-utils" is not configured.',
      500,
      'NOT_CONFIGURED'
    )
  }

  return { ...config } as IMeseretUtilsConfiguration
}
