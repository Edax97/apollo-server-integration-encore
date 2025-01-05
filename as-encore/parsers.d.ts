import { IncomingHttpHeaders } from "node:http";
export declare const parseHeadToQLS: (reqHeaders: () => IncomingHttpHeaders) => any;
type WriteHandT = (c?: string) => any;
type SetHedT = (k: string, v: string) => any;
type SetStatusCodeT = (sc: number) => any;
export declare const parseRespToRawApi: <Wt extends WriteHandT>(asRes: HTTPGraphQLResponse, setHeaderHandler: SetHedT, writeHandler: Wt, endHand?: Wt | undefined, setStatusCode?: SetStatusCodeT) => Promise<void>;
export {};
