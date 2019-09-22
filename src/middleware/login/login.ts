import { Middleware } from 'koa'
import { authenticate } from 'koa-passport'
import * as qs from 'qs'

export function login({
  strategyName = 'local',
  successRedirectQueryName = 'continue',
  defaultSuccessRedirect = '/',
  failureRedirectPath = '/login',
  failureRedirectQuery = {
    success: false,
    status: 401,
    code: 'WRONG_CREDENTIALS'
  }
}: {
  strategyName?: string
  successRedirectQueryName?: string
  defaultSuccessRedirect?: string
  failureRedirectPath?: string
  failureRedirectQuery?: any
}): Middleware {
  return async (ctx, next) =>
    authenticate(strategyName, {
      successRedirect:
        (ctx.query && ctx.query[successRedirectQueryName]) ||
        defaultSuccessRedirect,
      failureRedirect:
        failureRedirectPath +
        '?' +
        qs.stringify(
          Object.assign(qs.parse(ctx.querystring) || {}, failureRedirectQuery)
        )
    })(ctx, next)
}
