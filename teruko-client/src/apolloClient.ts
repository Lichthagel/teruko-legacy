import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";

const client = new ApolloClient({
    link: createUploadLink({
        uri: "http://192.168.1.178:3030/graphql"
    }),
    cache: new InMemoryCache({
        typePolicies: {
            Tag: {
                keyFields: ["slug"]
            },
            Query: {
                fields: {
                    images: {
                        keyArgs: ["tags", "sort"],
                        merge(existing, incoming, { args }) {
                            const skip = args?.skip || 0;
                            const merged = existing ? existing.slice(0) : [];
                            incoming.forEach((image: unknown, index: unknown) => {
                                merged[skip + index] = image;
                            });
                            return merged;
                        }
                    },
                    image: {
                        read(_, { args, toReference }) {
                            return toReference({
                                __typename: "Image",
                                id: args?.id
                            });
                        }
                    },
                    tag: {
                        read(_, { args, toReference }) {
                            return toReference({
                                __typename: "Tag",
                                slug: args?.slug
                            });
                        }
                    }
                }
            }
        }
    })
});

export default client;