import { Middleware } from 'koa'

export function sslRedirect(
  environments: string[] = ['production']
): Middleware {
  return async (ctx, next) => {
    if (
      !process.env.NO_SSL_REDIRECT &&
      process.env.NODE_ENV &&
      environments.includes(process.env.NODE_ENV) &&
      ctx.headers['x-forwarded-proto'] != 'https'
    ) {
      ctx.redirect('https://' + ctx.host + ctx.path + ctx.search + ctx.URL.hash)
    } else {
      await next()
    }
  }
}
