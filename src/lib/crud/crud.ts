import {
  ClientSession,
  Document,
  DocumentQuery,
  Model,
  ModelUpdateOptions,
  SaveOptions
} from 'mongoose'

import { KoaError } from '../koa-error/koa-error'
import { ObjectId } from '../../types/object-id/object-id'

export type IAddOptions<T extends Document> = {
  session?: ClientSession
  preSave?: (doc: T, session: ClientSession | null) => Promise<T>
  postSave?: (doc: T, session: ClientSession | null) => Promise<T>
}
export async function add<T extends Document>(
  model: Model<T>,
  data: any,
  { session, preSave, postSave }: IAddOptions<T> = {},
  options: SaveOptions = { session, validateBeforeSave: true }
): Promise<T> {
  if (!model)
    throw new KoaError('"model" parameter not found.', 500, 'NO_MODEL')

  let doc = data instanceof model ? data : new model(data)

  if (preSave) doc = await preSave(doc, session || null)
  doc = await doc.save({ session, validateBeforeSave: true, ...options })
  if (postSave) doc = await postSave(doc, session || null)

  return doc
}

export type IGetOptions<T extends Document> = {
  conditions?: any
  session?: ClientSession
  preQuery?: (
    model: Model<T>,
    session: ClientSession | null
  ) => DocumentQuery<T[], T>
  postQuery?: (
    query: DocumentQuery<T | null, T>,
    session: ClientSession | null
  ) => DocumentQuery<T | null, T>
}
export async function get<T extends Document>(
  model: Model<T>,
  _id: ObjectId | null,
  { conditions = {}, session, preQuery, postQuery }: IGetOptions<T> = {}
): Promise<T> {
  if (!model)
    throw new KoaError('"model" parameter not found.', 500, 'NO_MODEL')
  if (_id === undefined)
    throw new KoaError('"_id" parameter not found.', 400, 'NO_ID')

  if (_id !== null) conditions = { _id, ...conditions }

  let query: DocumentQuery<T | null, T>

  if (preQuery)
    query = preQuery(model, session || null)
      .findOne({ _id })
      .session(session || null)
  else query = model.findOne(conditions).session(session || null)

  if (postQuery) query = postQuery(query, session || null)

  const doc = await query
  if (!doc)
    throw new KoaError(
      `No "${model.modelName}" document by ${
        preQuery ? 'the provided pre-query and ' : ''
      }_id '${_id}'${postQuery ? ' and the provided post-query' : ''}.`,
      404,
      'DOCUMENT_NOT_FOUND'
    )

  return doc
}

export type IListOptions<T extends Document> = {
  conditions?: any
  since?: Date | number | string
  count?: number
  session?: ClientSession
  preQuery?: (
    model: Model<T>,
    session: ClientSession | null
  ) => DocumentQuery<T[], T>
  postQuery?: (
    query: DocumentQuery<T[], T>,
    session: ClientSession | null
  ) => DocumentQuery<T[], T>
}
export async function list<T extends Document>(
  model: Model<T>,
  {
    conditions = {},
    since,
    count,
    session,
    preQuery,
    postQuery
  }: IListOptions<T> = {}
): Promise<T[]> {
  if (!model)
    throw new KoaError('"model" parameter not found.', 500, 'NO_MODEL')

  let query: DocumentQuery<T[], T>

  if (preQuery)
    query = preQuery(model, session || null)
      .find(conditions)
      .session(session || null)
  else query = model.find(conditions).session(session || null)

  if (model.schema.path('_at'))
    query = query
      .sort({ _at: -1 })
      .where('_at')
      .lt(new Date(since || Date.now()).getTime())
      .limit(count || Number.MAX_SAFE_INTEGER)
      .session(session || null)

  if (postQuery) query = postQuery(query, session || null)

  return await query
}

export type ISearchOptions<T extends Document> = {
  conditions?: any
  since?: Date | number | string
  count?: number
  session?: ClientSession
  preQuery?: (
    model: Model<T>,
    session: ClientSession | null
  ) => DocumentQuery<T[], T>
  postQuery?: (
    query: DocumentQuery<T[], T>,
    session: ClientSession | null
  ) => DocumentQuery<T[], T>
}
export async function search<T extends Document>(
  model: Model<T>,
  term: string,
  {
    conditions = {},
    since,
    count,
    session,
    preQuery,
    postQuery
  }: ISearchOptions<T> = {}
): Promise<T[]> {
  if (!model)
    throw new KoaError('"model" parameter not found.', 500, 'NO_MODEL')

  if (!term) {
    return list(model, {
      conditions,
      since,
      count,
      session,
      preQuery,
      postQuery
    })
  }

  conditions = { $text: { $search: term }, ...conditions }

  let query: DocumentQuery<T[], T>

  // NOTE: if preQuery is used, search text score will have to be done manually
  if (preQuery)
    query = preQuery(model, session || null)
      .find(conditions)
      .session(session || null)
  else
    query = model
      .find(conditions, { _score: { $meta: 'textScore' } })
      .sort({ _score: { $meta: 'textScore' } })
      .session(session || null)

  if (model.schema.path('_at'))
    query = query
      .sort({ _at: -1 })
      .where('_at')
      .lt(new Date(since || Date.now()).getTime())
      .limit(count || Number.MAX_SAFE_INTEGER)
      .session(session || null)

  if (postQuery) query = postQuery(query, session || null)

  return await query
}

export type IEditOptions<T extends Document> = {
  conditions?: any
  session?: ClientSession
  preQuery?: (
    model: Model<T>,
    session: ClientSession | null
  ) => DocumentQuery<T[], T>
  postQuery?: (
    query: DocumentQuery<T | null, T>,
    session: ClientSession | null
  ) => DocumentQuery<T | null, T>
  preUpdate?: (doc: T, session: ClientSession | null) => Promise<T>
  postUpdate?: (raw: any, session: ClientSession | null) => Promise<any>
}
export async function edit<T extends Document>(
  model: Model<T>,
  _id: ObjectId | null,
  data: any,
  {
    conditions = {},
    session,
    preQuery,
    postQuery,
    preUpdate,
    postUpdate
  }: IEditOptions<T> = {},
  options: ModelUpdateOptions = { session, runValidators: true }
): Promise<T> {
  data = data instanceof model ? data.toObject() : data

  let doc = await get(model, _id, { conditions, session, preQuery, postQuery })

  if (preUpdate) {
    doc = await preUpdate(doc, session || null)
    if (!doc)
      throw new KoaError(
        `No "${model.modelName}" document by _id '${_id}' and the provided pre-update-query.`,
        404,
        'DOCUMENT_NOT_FOUND'
      )
  }

  let ret = await doc.update(data, { session, runValidators: true, ...options })

  if (postUpdate) ret = await postUpdate(ret, session || null)

  return ret
}

export type IRemoveOptions<T extends Document> = {
  conditions?: any
  check?: boolean | undefined
  session?: ClientSession
  preQuery?: (
    model: Model<T>,
    session: ClientSession | null
  ) => DocumentQuery<T[], T>
  postQuery?: (
    query: DocumentQuery<T | null, T>,
    session: ClientSession | null
  ) => DocumentQuery<T | null, T>
  preRemove?: (doc: T, session: ClientSession | null) => Promise<T>
  postRemove?: (doc: T, session: ClientSession | null) => Promise<T>
}
export async function remove<T extends Document>(
  model: Model<T>,
  _id: ObjectId | null,
  {
    conditions = {},
    check,
    session,
    preQuery,
    postQuery,
    preRemove,
    postRemove
  }: IRemoveOptions<T> = {}
): Promise<T | null> {
  if (!model)
    throw new KoaError('"model" parameter not found.', 500, 'NO_MODEL')
  if (_id === undefined)
    throw new KoaError('"_id" parameter not found.', 400, 'NO_ID')

  if (_id !== null) conditions = { _id, ...conditions }

  if (check === false)
    return await model.findOneAndRemove(conditions).session(session || null)

  let doc = await get(model, _id, { conditions, session, preQuery, postQuery })

  if (preRemove) {
    doc = await preRemove(doc, session || null)
    if (!doc)
      throw new KoaError(
        `No "${model.modelName}" document by _id '${_id}' and the provided pre-remove-query.`,
        404,
        'DOCUMENT_NOT_FOUND'
      )
  }

  doc.$session(session)
  doc = await doc.remove()

  if (postRemove) doc = await postRemove(doc, session || null)

  return doc
}
