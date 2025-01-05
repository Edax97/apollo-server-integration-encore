/// <reference types="node" />
import { ApolloServer, BaseContext, ContextFunction } from "@apollo/server";
import { RawHandler } from "encore.dev/api";
import { IncomingMessage, ServerResponse } from "node:http";
interface ContextFunArgs {
    req: IncomingMessage;
    res: ServerResponse;
}
type CtxFn<T extends BaseContext> = ContextFunction<[ContextFunArgs], T>;
/**
 * Abstraction that handles encore api layer on top of the gql relational service
 * @type <Tcontext> query wide context
 * @param aserver apollo instance
 * @param getContext user defines resolving ctx
 */
export declare function handlerToQLS(aserver: ApolloServer<BaseContext>, getContext?: CtxFn<BaseContext>): RawHandler;
export declare function handlerToQLS<Tctx extends BaseContext>(aserver: ApolloServer<Tctx>, getContext: CtxFn<Tctx>): RawHandler;
export {};
