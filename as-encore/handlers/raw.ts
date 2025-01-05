import {ApolloServer, BaseContext, ContextFunction} from "@apollo/server";
import {APIError, ErrCode, RawHandler} from "encore.dev/api";
import {IncomingMessage, ServerResponse} from "node:http";
import {json} from "node:stream/consumers";
import {parseHeadToQLS, parseRespToRawApi} from "../parsers";

interface ContextFunArgs {
    req: IncomingMessage;
    res: ServerResponse
}
type CtxFn<T extends BaseContext> = ContextFunction<[ContextFunArgs], T>;
const baseContextFun: CtxFn<BaseContext> = async () => ({})

/**
 * Raw handler that abstracts req parsing to graphQL server
 * @type <Tcontext> query wide context
 * @param aserver apollo instance
 * @param getContext user defines resolving ctx
 */
export function handlerToQLS
    (aserver: ApolloServer<BaseContext>, getContext?: CtxFn<BaseContext>) : RawHandler
export function handlerToQLS<Tctx extends BaseContext>
    (aserver: ApolloServer<Tctx>, getContext: CtxFn<Tctx>) : RawHandler
export function handlerToQLS<Tctx extends BaseContext>
    (aserver: ApolloServer<Tctx>, getContext?: CtxFn<Tctx>): RawHandler {
    // not typed endpoint handler
    // errors fall to gql layer
    return async (req, res) => {
        // instance listening
        aserver.assertStarted('Apollo instance not active');
        // compute data relation from query
        const context = (getContext || baseContextFun) as CtxFn<Tctx>;
        const httpGraphQLRes = await aserver.executeHTTPGraphQLRequest({
            httpGraphQLRequest: {
                headers: parseHeadToQLS(()=> req.headers),
                method: req.method!.toUpperCase(),
                body: await json(req),
                search: new URLSearchParams(req.url ?? "").toString(),
            },
            context: () => context({req, res})
        });
        // parse apollo resp to encore apiraw response listener
        await parseRespToRawApi(httpGraphQLRes,
            (k: string, v: string)=> {res.setHeader(k, v)},
            (c?: string) => {res.write(c || '')},
            (c?: string) => {res.end(c || '')},
            (status: number) => {res.statusCode = status})
    };
}

