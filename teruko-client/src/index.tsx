import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
import "./styles.css";

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
                        },
                        read(existing, { args }) {
                            if (!existing) return undefined;

                            const start = args?.skip || 0;
                            const end = args?.skip + args?.take || 10;

                            if (end > existing.length) return undefined;
                            // TODO

                            return existing.slice(start, end);
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

const app = document.getElementById("app");

ReactDOM.render(
    <ApolloProvider client={client}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ApolloProvider>,
    app
);