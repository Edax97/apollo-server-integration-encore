import {ApolloServer, BaseContext, ContextFunction} from "@apollo/server";
import {APICallMeta} from "encore.dev";
import {
    APIError,
    ErrCode,
    HandlerResponse,
    Middleware,
    middleware,
    MiddlewareOptions,
    MiddlewareRequest,
    ResponseHeader
} from "encore.dev/api";
import {parseHeadToQLS, parseRespToRawApi} from "../parsers";

interface ContextArgs {
    req: MiddlewareRequest;
}
type CtxFn<T extends BaseContext> = ContextFunction<[ContextArgs], T>
const baseContextFun: CtxFn<BaseContext> = async () => ({})
type TmwOpts = MiddlewareOptions & {target: {isRaw: false, isStream: false}};
const baseOptions: MiddlewareOptions = {target: {isRaw: false, isStream: false}};
/**
 * middleware that abstracts away parsing of req to QLS
 * @param aserver apollo QLS instance
 * @param getContext resolve ctx Fn
 * @param mwOptions target eps
 */
export function mwToQLS
    (aserver: ApolloServer<BaseContext>, getContext?: CtxFn<BaseContext>, mwOptions?: TmwOpts) : Middleware;
export function mwToQLS<Tctx extends BaseContext>
    (aserver: ApolloServer<Tctx>, getContext: CtxFn<Tctx>, mwOptions?: TmwOpts): Middleware;
export function mwToQLS<Tctx extends BaseContext>
    (aserver: ApolloServer<Tctx>, getContext?: CtxFn<Tctx>, mwOptions?: TmwOpts) {
    return middleware(mwOptions || baseOptions, async (req, next) => {
        // QLS instance listening
        aserver.assertStarted('Apollo instance not active')
        // Parse http req to apollo server dialect
        const context = ( getContext || baseContextFun ) as CtxFn<Tctx>;
        const requestMeta = req.requestMeta as APICallMeta;
        const httpGraphQLRequest = {
            headers: parseHeadToQLS(() => requestMeta.headers),
            method: requestMeta.method!.toUpperCase(),
            body: JSON.parse(requestMeta.parsedPayload?.body as string),
            search: new URLSearchParams(requestMeta.path || '').toString()
        }
        const httpGraphQLRes = await (aserver.executeHTTPGraphQLRequest({
            httpGraphQLRequest,
            context: () => context({req})
        }));
        // Error redirecting
        if (httpGraphQLRes.status || 200 >= 300) throw new APIError(ErrCode.Internal, 'Apollo server error');
        // Parse QLS resp to ResponseHandler
        const resPayload = {headers: new ResponseHeader(), status: httpGraphQLRes.status || 200, bodyS: ''};
        await parseRespToRawApi(httpGraphQLRes,
            (k: string, v: string) => {resPayload.headers.add(k, v)},
            (c?: string) => {resPayload.bodyS.concat(c || '')}
        )
        // calls next endpoint apiHandler
        await next(req);
        const { bodyS, ...payLoadArgs } = resPayload;
        return new HandlerResponse({...payLoadArgs, body: JSON.parse(bodyS)});
    })
}
