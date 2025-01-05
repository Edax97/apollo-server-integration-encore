import {describe, expect, it} from 'vitest'
import {testCases} from "./test-api-mocks";
import {queryTestApi} from "./set-test-server";

/**
 * test '/test' endpoint response data when querying and diagnosing
 */
describe('as-encore tests', () => {
    testCases.forEach(({description, query: {document, variables}, expectThisResp}) => {
        it(description, async () => {
            const result = await queryTestApi(document, variables);
            //console.log(result, typeof result.data);
            // testing result against expData
            expectThisResp.dataDef ? expect(result.data).toBeDefined() : expect(result.data).toBeUndefined();
            expectThisResp.errorDef ? expect(result.errors).toBeDefined() : expect(result.errors).toBeUndefined();
            if (expectThisResp.data) expect(result.data).toEqual(expectThisResp.data);
            if (expectThisResp.statusOK) expect(result.status).toBeGreaterThan(299);
        })

    })

})


