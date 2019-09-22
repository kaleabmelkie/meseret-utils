import { Context } from 'koa'
import { Document } from 'mongoose'

export class KoaController {
  constructor(
    private readonly ctx?: Context,
    private readonly next?: () => Promise<any>
  ) {}

  protected getContext(): Context | undefined {
    return this.ctx
  }

  protected getNext(): (() => Promise<any>) | undefined {
    return this.next
  }

  protected getParams<Type extends { [param: string]: string }>(): Type {
    return (this.ctx && this.ctx.params) || {}
  }

  protected getParam(key: string): string {
    return this.getParams() && this.getParams()[key]
  }

  protected getQueries<Type extends { [param: string]: string }>(): Type {
    return (this.ctx && this.ctx.query) || {}
  }

  protected getQuery(key: string): string {
    return this.getQueries() && this.getQueries()[key]
  }

  protected getRequestBody<Type>(): Type {
    return this.ctx && this.ctx.request.body
  }

  protected getUser<UserType>(): Document & UserType | null {
    return this.ctx && this.ctx.state.user
  }
}
