# meseret-utils

A collection of handy utility functions and middleware compatible with [meseret](https://github.com/kaleabmelkie/meseret).

[![meseret-utils](https://img.shields.io/npm/v/meseret-utils.png?style=flat-square)](https://www.npmjs.org/package/meseret-utils)
[![npm downloads](https://img.shields.io/npm/dm/meseret-utils.svg?style=flat-square)](https://www.npmjs.org/package/meseret-utils)
[![npm](https://img.shields.io/npm/dt/meseret-utils.svg?style=flat-square)](https://www.npmjs.org/package/meseret-utils)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![Greenkeeper badge](https://badges.greenkeeper.io/kaleabmelkie/meseret-utils.svg)](https://greenkeeper.io/)

## Getting Started

To install, inside a [meseret](https://github.com/kaleabmelkie/meseret) project:

```bash
yarn add meseret-utils

# or, using npm:
# npm i meseret-utils --save
```

Then, we'll need to run the configuration/setup function (called `configureMeseretUtils`) at our app's entry like:

```ts
// maybe, your index.ts

import { ServerApp } from 'meseret'
import { configureMeseretUtils } from 'meseret-utils'

import { serverAppConfig } from './path/to/your/server-app-config'

export const serverApp = new ServerApp(serverAppConfig)

configureMeseretUtils({
  serverApp
})

serverApp.start().catch(console.error)
```

## Utils

###### Helper Functions

- [C.R.U.D.](src/lib/crud/crud.ts): a collection of functions (`add`, `get`, `list`, `search`, `edit` and `remove`) that perform read and write operations on MongoDB collections (as modelled by mongoose); these functions include extensive error handling, and highly customizable querying and action plugging.

- [email](src/lib/email/email.ts): an easy way to send an email.

- [Grid](src/lib/grid/grid.ts): a nice abstraction of GridFS, the large-file-size-capable storage system inside MongoDB.

- [KoaController](src/lib/koa-controller/koa-controller.ts): a controller super-class that works hand-in-hand with our [handle](src/middleware/handle/handle.ts) middleware.

- [KoaError](src/lib/koa-error/koa-error.ts): an extension of `Error` (with support for error `code` and HTTP `status`) that is compatible with [koa](https://koajs.com/) and our `handle` middleware.

- [password](src/lib/password/password.ts): a pair of functions that assist in an account's password reset process.

- _[PhotoGrid](src/lib/photo-grid/photo-grid.ts): coming soon, in the next few feature releases._

- [transact](src/lib/transact/transact.ts): an abstraction to quickly support MongoDB's session-based multi-document ACID-compatible transactions; these require MongoDB 4+.

###### Koa Middleware

- [authenticate](src/middleware/authenticate/authenticate.ts): handles account authentication checks using [koa-passport](https://www.npmjs.com/package/koa-passport) and responds to errors graciously.

- [authorize](src/middleware/authorize/authorize.ts): handles authorization by account roles, after implicitly calling our `authenticate` middleware.

- [handle](src/middleware/handle/handle.ts): a koa middleware that implicitly calls our `transact` function on our `koa-controller` methods and nicely handles our `koa-error` throws.

- [login](src/middleware/login/login.ts): a helper koa middleware to quickly login to an account using `koa-passport`.

- [logout](src/middleware/logout/logout.ts): a helper koa middleware to quickly logout from an account.

- [sslRedirect](src/middleware/ssl-redirect/ssl-redirect.ts): a koa middleware that redirects all HTTP requests to HTTPS in "production" environments (unless other environments are passed to it).

###### Mongoose Models

- [KeyModel](src/models/key/key-model.ts): a mongoose data model used in our `password` reset functions to store unique keys (tokens).

###### Types

- [ObjectId](src/types/object-id/object-id.ts): a shortcut for the type `mongoose.Schema.Types.ObjectId | string`.

## License

Proudly, made with &hearts; in Addis Ababa.

[MIT License](LICENSE) &copy; 2019 [Kaleab S. Melkie](https://bit.ly/kaleab)
