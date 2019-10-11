# meseret-utils change log

### v0.0.6

- Limit public exports API of the library
- Isolate state and pre-state imports to avoid several deadlocks and bugs

#### v0.0.5

- Bug fix: missing dist folder in npm shipment

#### v0.0.4

- Bug fix: use custom mongoose instance for `KeyModel`

#### v0.0.3

- Remove four middleware (`authenticate`, `authorize`, `login` and `logout`) because they belong in an account module
- Add two new options for configuration: `applySslRedirect` and `addModels`.
- Bug fixes related to configuration and state indicator
- Include TypeScript src in npm shipment for a better debugging experience.

#### v0.0.2

- Several package-architecture bug fixes
- Improved help in the [README.md](README.md) file

#### v0.0.1

- Initial release with 7 lib functions, 1 mongoose model and 6 koa middleware.
