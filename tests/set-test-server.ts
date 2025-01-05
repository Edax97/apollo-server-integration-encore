import {ApolloServer, ApolloServerOptions, BaseContext} from "@apollo/server";
import {GraphQLClient} from "graphql-request";
import {GraphQLError} from "graphql/error/index.js";
import {DocumentNode} from "graphql/language";
import {serverDef} from "./test-api-mocks";
export interface GraphQLRequest {
    query?: string;
    variables?: object;
    operationName?: string;
    extensions?: Record<string, unknown>;
}
export interface StoreT<Tctx extends BaseContext> {
    server: ApolloServer<Tctx>;
}
export interface FetchResult {
    data: any;
    errors?: any;
    extensions?: any;
}
export interface APIres {
    data: any;
    status: number;
    errors?: GraphQLError[];
}

/**
 * Client pointing to /test
 */
const uri = 'http://localhost:4000/test';
export const testClient = new GraphQLClient(uri);
/**
 * Init apollo instance from definition options
 * @imported serverDef server signature definition
 */
export const apolloStore: StoreT<BaseContext> = {
    server: new ApolloServer(serverDef)
}
export const startServer = async () => {
    await apolloStore.server.start();
}
export const cleanServer = async () => {
    try {
        apolloStore.server.assertStarted('Server not started');
        await apolloStore.server.stop();
    } catch (error) {
        console.log(error);
    }
}
/**
 * Method that extends rawRequest by mapping errors for testing purposes
 * @return {status, data, errors}
 */
export const queryTestApi = async (query: string, variables?: Object) : Promise<APIres> => {
    try {
        const resp = await testClient.rawRequest(query, variables);
        const {status, data, errors} = resp;
        return {status, data, errors};
    } catch (e: any) {
        return ({
            status: 500,
            data: undefined,
            errors: [new GraphQLError(e.message)]
        })
    }


}

/**
 * make a query to a new configured apollo instance (by encore-provisioned api)
 * @param apolloConfig
 * @param document
 */
export async function apolloSetThenQuery(apolloConfig: ApolloServerOptions<BaseContext>, document: DocumentNode) : Promise<FetchResult>{
    /* clean last and start new instance */
    await cleanServer();
    apolloStore.server = new ApolloServer(apolloConfig);
    await startServer();
    /* call the instance */
    return await testClient.request({document});
}
