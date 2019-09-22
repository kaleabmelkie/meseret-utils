import { Middleware } from 'koa'
import Compose from 'koa-compose'

import { authenticate, IAuthenticateConfig, KoaError } from '../..'

export type IAccountWithRoles<AccountRoleType> = {
  roles: AccountRoleType[]
}

export type IAuthorizeConfig<OtherAccountStatusTypes> = {
  error?: {
    message?: string
    status?: number
    code?: string
  }
  authenticateConfig?: IAuthenticateConfig<OtherAccountStatusTypes>
}

const defaultErrorMessage = 'Forbidden' // but really, it is "Unauthorized"
const defaultErrorStatus = 403
const defaultErrorCode = 'NOT_AUTHORIZED'

export function authorize<AccountRoleType, OtherAccountStatusTypes>(
  allowedRoles: AccountRoleType[],
  {
    error = {
      message: defaultErrorMessage,
      status: defaultErrorStatus,
      code: defaultErrorCode
    },
    authenticateConfig = {}
  }: IAuthorizeConfig<OtherAccountStatusTypes> = {}
): Middleware {
  return Compose([
    authenticate(authenticateConfig),
    async (ctx, next) => {
      const accountRoles = (<{ user: IAccountWithRoles<AccountRoleType> }>(
        ctx.state
      )).user.roles

      let permitted = false
      for (const role of allowedRoles) {
        if (accountRoles.includes(role)) {
          permitted = true
          break
        }
      }

      if (!permitted) {
        ctx.throw(
          new KoaError(
            (error && error.message) || defaultErrorMessage,
            (error && error.status) || defaultErrorStatus,
            (error && error.code) || defaultErrorCode
          )
        )
      } else {
        await next()
      }
    }
  ])
}
