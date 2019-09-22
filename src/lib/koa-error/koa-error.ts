export class KoaError extends Error {
  constructor(
    public errmsg?: string,
    public status = 500,
    public code?: string
  ) {
    super(errmsg)
  }

  get fullMessage(): string {
    return `${this.code || 'UNKNOWN_CODE'}: ${this.message ||
      this.errmsg ||
      (<any>this).statusMessage ||
      'Unknown error.'} (Status: ${this.status || 'Unknown'})`
  }

  get prettyMessage(): string {
    return `${this.code ? this.code + ': ' : ''}${this.message ||
      this.errmsg ||
      (<any>this).statusMessage ||
      'Unknown error.'}`
  }
}
