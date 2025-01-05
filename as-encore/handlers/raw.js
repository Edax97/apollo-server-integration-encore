import { APIError, ErrCode } from "encore.dev/api";
import { json } from "node:stream/consumers";
import { parseHeadToQLS, parseRespToRawApi } from "../parsers";
const baseContextFun = async () => ({});
export function handlerToQLS(aserver, getContext) {
    // not typed endpoint handler
    // errors fall to gql layer
    return async (req, res) => {
        // instance listening
        aserver.assertStarted('Apollo instance not active');
        // compute data relation from query
        const context = (getContext || baseContextFun);
        const httpGraphQLRes = await aserver.executeHTTPGraphQLRequest({
            httpGraphQLRequest: {
                headers: parseHeadToQLS(() => req.headers),
                method: req.method.toUpperCase(),
                body: await json(req),
                search: new URLSearchParams(req.url ?? "").toString(),
            },
            context: () => context({ req, res })
        });
        // error collecting
        if (httpGraphQLRes.status || 200 >= 300)
            throw new APIError(ErrCode.Internal, 'Apollo server error');
        // parse apollo resp to encore apiraw response listener
        await parseRespToRawApi(httpGraphQLRes, (k, v) => { res.setHeader(k, v); }, (c) => { res.write(c || ''); }, (c) => { res.end(c || ''); }, (status) => { res.statusCode = status; });
    };
}
//# sourceMappingURL=raw.js.map