import { APIError, ErrCode, HandlerResponse, middleware, ResponseHeader } from "encore.dev/api";
import { parseHeadToQLS, parseRespToRawApi } from "../parsers";
const baseContextFun = async () => ({});
const baseOptions = { target: { isRaw: false, isStream: false } };
export function mwToQLS(aserver, getContext, mwOptions) {
    return middleware(mwOptions || baseOptions, async (req, next) => {
        // QLS instance listening
        aserver.assertStarted('Apollo instance not active');
        // Parse http req to apollo server dialect
        const context = (getContext || baseContextFun);
        const requestMeta = req.requestMeta;
        const httpGraphQLRequest = {
            headers: parseHeadToQLS(() => requestMeta.headers),
            method: requestMeta.method.toUpperCase(),
            body: JSON.parse(requestMeta.parsedPayload?.body),
            search: new URLSearchParams(requestMeta.path || '').toString()
        };
        const httpGraphQLRes = await (aserver.executeHTTPGraphQLRequest({
            httpGraphQLRequest,
            context: () => context({ req })
        }));
        // Error redirecting
        if (httpGraphQLRes.status || 200 >= 300)
            throw new APIError(ErrCode.Internal, 'Apollo server error');
        // Parse QLS resp to ResponseHandler
        const resPayload = { headers: new ResponseHeader(), status: httpGraphQLRes.status || 200, bodyS: '' };
        await parseRespToRawApi(httpGraphQLRes, (k, v) => { resPayload.headers.add(k, v); }, (c) => { resPayload.bodyS.concat(c || ''); });
        // calls next endpoint apiHandler
        await next(req);
        const { bodyS, ...payLoadArgs } = resPayload;
        return new HandlerResponse({ ...payLoadArgs, body: JSON.parse(bodyS) });
    });
}
//# sourceMappingURL=typed-handler.js.map