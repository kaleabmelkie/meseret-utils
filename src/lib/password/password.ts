import { Model, Document, ClientSession } from 'mongoose'
import { stringify } from 'qs'

import { KoaError } from '../koa-error/koa-error'
import { KeyModel } from '../../models/key-model'
import { email } from '../email/email'

type ModelThatCanSetPassword = Model<
  Document & {
    email: string
    setPassword: (password: string, session?: ClientSession) => Promise<void>
  }
>

export type IPasswordResetStartRequest = {
  emailTo: string
}

export type IPasswordResetStartParameters = IPasswordResetStartRequest & {
  domain: string
}

export type IPasswordResetFinishRequest = {
  emailTo: string
  randomKey: string
  password: string
}

export async function startPasswordReset(
  model: ModelThatCanSetPassword,
  { emailTo, domain }: IPasswordResetStartParameters,
  { session, finishPath }: { session?: ClientSession; finishPath?: string } = {}
): Promise<void> {
  if (!model)
    throw new KoaError('"model" parameter not found.', 500, 'NO_MODEL')
  if (!emailTo)
    throw new KoaError('"emailTo" parameter not found.', 400, 'NO_EMAIL_TO')
  if (!domain)
    throw new KoaError('"domain" parameter not found.', 500, 'NO_DOMAIN')

  const doc = await model
    .findOne({ email: emailTo.toLowerCase() })
    .session(session || null)
  if (!doc)
    throw new KoaError(
      `No document by "${emailTo.toLowerCase()}".`,
      404,
      'DOCUMENT_NOT_FOUND'
    )

  const randomKey = await KeyModel.add(
    'PASSWORD_RESET',
    emailTo,
    undefined,
    undefined,
    {
      session
    }
  )

  return email({
    to: emailTo,
    subject: 'Account Password Reset',
    html: `
      <html lang="en">
        <head>
          <title>Account Password Reset</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              background-color: rgb(230,230,230);
            }
            p {
              display: block;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              font-size: 16px;
              font-weight: 100;
              color: rgb(45,45,45)
            }
            a {
              color: rgb(0,180,120);
            }
          </style>
        </head>
        <body>
          <h3>Account Password Reset Verification</h3>
          <p>
            Within one hour from the time this email was sent, you can
            reset your  account password by following 
            <a href="${domain.replace(/\/$/, '')}${finishPath ||
      '/reset/finish'}?${stringify({
      email: emailTo,
      randomKey: randomKey
    })}">this link</a>.
          </p>
        </body>
      </html>`
  })
}

export async function finishPasswordReset(
  model: ModelThatCanSetPassword,
  { emailTo, randomKey, password }: IPasswordResetFinishRequest,
  { session }: { session?: ClientSession } = {}
): Promise<void> {
  if (!model)
    throw new KoaError('"model" parameter not found.', 500, 'NO_MODEL')
  if (!emailTo)
    throw new KoaError('"emailTo" parameter not found.', 400, 'NO_EMAIL_TO')
  if (!randomKey)
    throw new KoaError('"randomKey" parameter not found.', 400, 'NO_RANDOM_KEY')
  if (!password)
    throw new KoaError('"password" parameter not found.', 400, 'NO_PASSWORD')

  if (
    !(await KeyModel.match('PASSWORD_RESET', emailTo, randomKey, { session }))
  )
    throw new KoaError(
      'Password reset randomKey expired or not found.',
      403,
      'KEY_INVALID'
    )

  const doc = await model
    .findOne({ email: emailTo.toLowerCase() })
    .session(session || null)
  if (!doc)
    throw new KoaError(
      `No document by email "${emailTo.toLowerCase()}".`,
      404,
      'DOCUMENT_NOT_FOUND'
    )

  await doc.setPassword(password, session)

  return KeyModel.delete(randomKey, { session })
}
