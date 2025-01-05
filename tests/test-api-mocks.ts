import {ApolloServerOptions, BaseContext} from "@apollo/server";
import { gql } from "graphql-request";

interface TestCase{
    description: string;
    query: {
        document: string;
        variables?: Object;
    }
    expectThisResp: {
        dataDef: boolean;
        errorDef?: boolean;
        statusOK?: number;
        data?: any
    };
}

/**
 * server configuration: query resolving definition
 */
export const serverDef: ApolloServerOptions<BaseContext> = {
    typeDefs: gql`
                type Query {
                    testString: String
                    appendTestString(append: String!): String
                }
            `,
    stopOnTerminationSignals: false,
    nodeEnv: '',
    rootValue: {
        testString: 'testString2',
        appendTestString: ''
    },
    resolvers: {
        Query: {
            testString: () => 'testing',
            appendTestString: (parent, args) => parent.testString.concat(args.append)
        }
    }
}
/**
 * Tuples (queryDoc, expectedData)
 */
export const testCases: TestCase[] = [
    {
        description: 'Basic query',
        query: {
            document: gql`
                query { testString }
            `
        },
        expectThisResp: {
                dataDef: true,
                errorDef: false,
                data: { testString: 'testing' }
            }
    },
    {
        description: 'Introspection query',
        query: {
            document: gql`{
                __schema {
                    directives {
                        name
                    }
                }
            }
            `
        },
        expectThisResp: {
            dataDef: true,
            errorDef: false
        }
    },
    {
        description: 'Correct input',
        query: {
            document: gql`
            query($append: String!) {
                appendTestString(append: $append)
            }`,
            variables: {
                append: ' this'
            }
        },
        expectThisResp: {
            dataDef: true,
            errorDef: false,
            data: { appendTestString: 'testing this' }
        }
    },
    {
        description: 'Bad input type',
        query: {
            document: gql`
                query {
                    appendTestString(append: ${5})
                }`
        },
        expectThisResp: {
            dataDef: false,
            errorDef: true
        }
    },
    {
        description: 'Null input',
        query: {
            document: gql`
                query {
                    appendTestString
                }
            `
        },
        expectThisResp: {
            dataDef: false,
            errorDef: true
        }
    }
]
