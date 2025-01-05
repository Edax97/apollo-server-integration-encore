import { HeaderMap } from "@apollo/server";
export const parseHeadToQLS = (reqHeaders) => {
    const headers = new HeaderMap();
    for (const [key, value] of Object.entries(reqHeaders())) {
        if (!value)
            continue;
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
    return headers;
};
export const parseRespToRawApi = async (asRes, setHeaderHandler, writeHandler, endHand, setStatusCode) => {
    const endHandler = endHand || writeHandler;
    setStatusCode !== undefined ? setStatusCode(asRes.status || 200) : null;
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
};
//# sourceMappingURL=parsers.js.map