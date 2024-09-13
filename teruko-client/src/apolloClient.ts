import { ApolloClient, InMemoryCache } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

import { API_URL } from "./constants";

const client = new ApolloClient({
  link: createUploadLink({
    uri: API_URL,
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
            merge(existing: { __ref: string }[] = [], incoming: { __ref: string }[], { args }: { args: Record<string, unknown> | null }) {
              if (args?.sort === "random") {
                return [
                  ...existing,
                  ...incoming.filter(
                    (incomingImage: { __ref: string }) =>
                      !existing.some(
                        (el: { __ref: string }) =>
                          el.__ref === incomingImage.__ref,
                      ),
                  ),
                ];
              }

              const skip = args?.skip as number | null || 0;
              const merged = [...existing];
              for (const [index, image] of incoming.entries()) {
                merged[skip + index] = image;
              }
              return merged;
            },
          },
          image: {
            read(_, { args, toReference }) {
              return toReference({
                __typename: "Image",
                id: args?.id as string,
              });
            },
          },
          tag: {
            read(_, { args, toReference }) {
              return toReference({
                __typename: "Tag",
                slug: args?.slug as string,
              });
            },
          },
        },
      },
    },
  }),
});

export default client;
