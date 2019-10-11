import { Context, Middleware, ParameterizedContext } from 'koa'
import { ClientSession } from 'mongoose'

import { transact } from '../../lib/transact/transact'
import { getMeseretUtilsState } from '../../state'

type Constructor<T> = { new (...args: any[]): T }

export function handle<ControllerType>(
  controller: Constructor<ControllerType>,
  handler: (
    controller: ControllerType,
    session: ClientSession,
    ctx: Context | ParameterizedContext,
    next: () => Promise<any>
  ) => Promise<any>
): Middleware {
  return async (ctx, next) => {
    try {
      ctx.body = await transact(session =>
        handler(new controller(ctx), session, ctx, next)
      )
    } catch (e) {
      if (getMeseretUtilsState().serverApp.env !== 'production') {
        console.error(e)
      }
      ctx.status = e.status || e.statusCode || 500
      ctx.body = {
        success: false,
        fullMessage: e.fullMessage,
        prettyMessage: e.prettyMessage,
        code: e.code,
        message: e.message || e.errmsg,
        status: e.status || e.statusCode,
        statusMessage: e.statusMessage
      }
    }
  }
}
