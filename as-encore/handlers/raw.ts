import {ApolloServer, BaseContext, ContextFunction} from "@apollo/server";
import {RawHandler} from "encore.dev/api";
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
 * Raw handler for parsing and directing queries to graphQL server
 * @type <Tcontext> type of query context object
 * @param aserver apollo instance
 * @param getContext user defines context resolution
 */
export function gqlQueryHandler
    (aserver: ApolloServer<BaseContext>, getContext?: CtxFn<BaseContext>) : RawHandler
export function gqlQueryHandler<Tctx extends BaseContext>
    (aserver: ApolloServer<Tctx>, getContext: CtxFn<Tctx>) : RawHandler
export function gqlQueryHandler<Tctx extends BaseContext>
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

