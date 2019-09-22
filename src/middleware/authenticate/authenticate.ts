import { Middleware } from 'koa'

import { KoaError } from '../..'

export type AccountStatusType<OtherAccountStatusTypes> =
  | 'ACTIVE'
  | OtherAccountStatusTypes

export type IAccountWithStatus<OtherAccountStatusTypes> = {
  status: AccountStatusType<OtherAccountStatusTypes>
}

export type IAuthenticateConfig<OtherAccountStatusTypes> = {
  error?: {
    message?: string
    status?: number
    code?: string
  }
  allowedAccountStatuses?: AccountStatusType<OtherAccountStatusTypes>[]
  inactiveAccountError?: {
    message?: string
    status?: number
    code?: string
  }
}

const defaultErrorMessage = 'Unauthorized' // but really, it is "Unauthenticated"
const defaultErrorStatus = 401
const defaultErrorCode = 'NOT_AUTHENTICATED'

const defaultInactiveAccountErrorMessage = 'Inactive account'
const defaultInactiveAccountErrorStatus = 403
const defaultInactiveAccountErrorCode = 'INACTIVE_ACCOUNT'

export function authenticate<OtherAccountStatusTypes>({
  error = {
    message: defaultErrorMessage,
    status: defaultErrorStatus,
    code: defaultErrorCode
  },
  allowedAccountStatuses = ['ACTIVE'],
  inactiveAccountError = {
    message: defaultInactiveAccountErrorMessage,
    status: defaultInactiveAccountErrorStatus,
    code: defaultInactiveAccountErrorCode
  }
}: IAuthenticateConfig<OtherAccountStatusTypes> = {}): Middleware {
  return async (ctx, next) => {
    if (!(ctx.isAuthenticated && ctx.isAuthenticated())) {
      ctx.throw(
        new KoaError(
          (error && error.message) || defaultErrorMessage,
          (error && error.status) || defaultErrorStatus,
          (error && error.code) || defaultErrorCode
        )
      )
    } else if (
      !allowedAccountStatuses.includes(
        (ctx.state.user as IAccountWithStatus<OtherAccountStatusTypes>).status
      )
    ) {
      ctx.throw(
        new KoaError(
          (inactiveAccountError && inactiveAccountError.message) ||
            defaultInactiveAccountErrorMessage,
          (inactiveAccountError && inactiveAccountError.status) ||
            defaultInactiveAccountErrorStatus,
          (inactiveAccountError && inactiveAccountError.code) ||
            defaultInactiveAccountErrorCode
        )
      )
    } else {
      await next()
    }
  }
}
