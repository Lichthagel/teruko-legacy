import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
import { Image } from "./models";

const client = new ApolloClient({
  link: createUploadLink({
    uri: `/graphql`,
    headers: {
      "Apollo-Require-Preflight": "true",
    },
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Tag: {
        keyFields: ["slug"],
      },
      Query: {
        fields: {
          images: {
            keyArgs: ["tags", "sort"],
            // eslint-disable-next-line @typescript-eslint/default-param-last
            merge(existing = [], incoming, { args }) {
              if (args?.sort === "random")
                return [
                  ...existing,
                  ...incoming.filter(
                    (incomingImage: { __ref: string }) =>
                      existing.findIndex(
                        (el: { __ref: string }) =>
                          el.__ref === incomingImage.__ref
                      ) === -1
                  ),
                ];

              const skip = args?.skip || 0;
              const merged = existing.slice(0);
              incoming.forEach((image: Image, index: number) => {
                merged[skip + index] = image;
              });
              return merged;
            },
          },
          image: {
            read(_, { args, toReference }) {
              return toReference({
                __typename: "Image",
                id: args?.id,
              });
            },
          },
          tag: {
            read(_, { args, toReference }) {
              return toReference({
                __typename: "Tag",
                slug: args?.slug,
              });
            },
          },
        },
      },
    },
  }),
});

export default client;
