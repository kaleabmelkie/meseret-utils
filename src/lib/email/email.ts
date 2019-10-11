import { createTransport, SentMessageInfo } from 'nodemailer'

import { KoaError } from '../koa-error/koa-error'

export interface IEmailConfig {
  service?: string // default is 'gmail'

  from?: string
  pass?: string

  subject?: string
  to: string
  html?: string
  text?: string
}

export function email(config: IEmailConfig): Promise<SentMessageInfo> {
  if (process.env.NO_EMAIL === 'true') {
    console.warn(
      'WARNING! Skipping sending an email, because NO_EMAIL environment variable is set to true.'
    )
    return undefined as any
  }

  if (!config)
    throw new KoaError(
      'Email configuration is not found.',
      500,
      'NO_EMAIL_CONFIG'
    )
  if (!config.from && !process.env.EMAIL_FROM)
    throw new KoaError(
      'Sender email address not provided.',
      500,
      'NO_EMAIL_FROM'
    )
  if (!config.pass && !process.env.EMAIL_PASS)
    throw new KoaError(
      'Sender email password not provided.',
      500,
      'NO_EMAIL_PASS'
    )
  if (!config.to)
    throw new KoaError(
      'Target emailTo address not provided.',
      400,
      'NO_EMAIL_TO'
    )
  if (!config.html && !config.text)
    throw new KoaError(
      "Neither 'emailTo.html' nor 'emailTo.text' is provided.",
      400,
      'NO_EMAIL_BODY'
    )

  return createTransport({
    service: config.service || process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: config.from || process.env.EMAIL_FROM,
      pass: config.pass || process.env.EMAIL_PASS
    }
  }).sendMail({
    from: config.from || process.env.EMAIL_FROM,
    to: config.to,
    subject: config.subject || '',
    html: config.html,
    text: !config.html ? config.text : ''
  })
}
