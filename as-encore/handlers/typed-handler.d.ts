import { ApolloServer, BaseContext, ContextFunction } from "@apollo/server";
import { Middleware, MiddlewareOptions, MiddlewareRequest } from "encore.dev/api";
interface ContextArgs {
    req: MiddlewareRequest;
}
type CtxFn<T extends BaseContext> = ContextFunction<[ContextArgs], T>;
type TmwOpts = MiddlewareOptions & {
    target: {
        isRaw: false;
        isStream: false;
    };
};
/**
 * middleware that abstracts away parsing of req to QLS
 * @param aserver apollo QLS instance
 * @param getContext resolve ctx Fn
 * @param mwOptions target eps
 */
export declare function mwToQLS(aserver: ApolloServer<BaseContext>, getContext?: CtxFn<BaseContext>, mwOptions?: TmwOpts): Middleware;
export declare function mwToQLS<Tctx extends BaseContext>(aserver: ApolloServer<Tctx>, getContext: CtxFn<Tctx>, mwOptions?: TmwOpts): Middleware;
export {};
