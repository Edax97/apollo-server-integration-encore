import {HeaderMap, HTTPGraphQLResponse} from "@apollo/server";
import {IncomingHttpHeaders} from "node:http";

export const parseHeadToQLS = (reqHeaders: () => IncomingHttpHeaders) => {
    const headers = new HeaderMap()
    for (const [key, value] of Object.entries(reqHeaders())) {
        if (!value) continue;
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
    return headers;
}
type WriteHandT = (c?: string) => any;
type SetHedT = (k: string, v: string) => any;
type SetStatusCodeT = (sc: number) => any;
export const parseRespToRawApi = async <Wt extends WriteHandT>
    (asRes: HTTPGraphQLResponse, setHeaderHandler: SetHedT,
     writeHandler: Wt, endHand?: Wt,
     setStatusCode?: SetStatusCodeT)=> {
    const endHandler = endHand || writeHandler;
    setStatusCode !== undefined ? setStatusCode(asRes.status || 200) : null
    for (const [key, value] of asRes.headers) {
        setHeaderHandler(key, value);
    }
    if (asRes.body.kind === "complete") {
        endHandler(asRes.body.string);
        return;
    }
    for await (const chunk of asRes.body.asyncIterator) {
        writeHandler(chunk);
    }
    endHandler();
    return;
}