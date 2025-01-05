import {api} from "encore.dev/api";
import {gqlQueryHandler} from "../as-encore/handlers/raw";
import {apolloStore, startServer} from "../tests/set-test-server";

await startServer();

/**
 * Define endpoint for testing queries to qql server
 * @param req gql request
 * @return res queried data
 */
export const testAPI = api.raw(
    { path: '/test', method: '*', expose: true},
    async (req, res) => {
        const fn = gqlQueryHandler(apolloStore.server);
        fn(req, res);
    }
    )
