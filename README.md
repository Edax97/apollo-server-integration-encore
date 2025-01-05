# Apollo server integrations for encore.ts

## Introduction

This package allows for defining encore.ts graphQL APIs on top of an @apollo/server instance. Specifically, 
it provides request handlers for parsing and directing queries to the instance we define. Optionally, we pass
to `getContext` a method to resolve query context.

## Requirements
- @apollo/server 4.0.0 or later
- encore.dev 1.45.0 or later
- node.js 20.0.0 or later

## Installation
First, set up an encore application
```bash
encore app create 
```
Install @apollo/server and the integration
```bash
npm install @apollo/server as-encore
```

## Usage

Inside a new service, set up a raw API endpoint that will listen to client queries. Previously, you need to configure and
start an apollo server instance and optionally give the context getter function.
```typescript
import {gqlQueryHandler} from "as-encore/handlers/raw";
/**
 * Define endpoint for testing queries to qql server
 * @param req gql request
 * @return res queried data
 */
export const gqlEndpoint = api.raw(
        { path: '/gql', method: '*', expose: true},
        gqlQueryHandler<Tcontext>(apolloServer, getContext)
    )
```

## Reference
```typescript
/**
 * Raw handler for parsing and directing queries to graphQL server
 * @type <Tctx> type of query context object
 * @param aserver apollo instance
 * @param getContext method for resolving context
    * @param req http IncommingMessage
    * @param res http ServerResponse
    * @return Promise<Tctx>
 */
export function gqlQueryHandler<Tctx extends BaseContext>
    (aserver: ApolloServer<Tctx>, getContext?: CtxFn<Tctx>): RawHandler {/.../}
```

## Contributing

Any contribution is welcomed, see the last commit for pending work.

## Main contributor

- Edmar Campos ([Edax97](https://github.com/Edax97))
