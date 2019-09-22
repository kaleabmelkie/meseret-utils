import { Middleware } from 'koa'

export function logout({
  successRedirectPath,
  successStatus = 200,
  successBody,
  failureRedirectPath,
  failureStatus = 500,
  failureBody
}: {
  successRedirectPath?: string
  successStatus?: number
  successBody?: any
  failureRedirectPath?: string
  failureStatus?: number
  failureBody?: any
}): Middleware {
  return async ctx => {
    ctx.logout()

    if (!ctx.isAuthenticated()) {
      if (successRedirectPath != null) ctx.redirect(successRedirectPath)
      ctx.status = successStatus
      ctx.body = successBody
    } else {
      if (failureRedirectPath != null) ctx.redirect(failureRedirectPath)
      ctx.status = failureStatus
      ctx.body = failureBody
    }
  }
}
