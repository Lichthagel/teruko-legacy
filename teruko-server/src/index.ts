import { GraphQLUpload, graphqlUploadExpress } from "graphql-upload";
import { ApolloServer } from "apollo-server-express";
import context from "./context.js";
import express from "express";
import fs from "fs";
import path, { dirname } from "path";
import resolvers from "./resolvers/index.js";
import { fileURLToPath } from "url";

process.setMaxListeners(0);

const port = 3030;

(async function() {
    const app = express();

    app.use(
        "/img",
        express.static(context.imgFolder, {
            index: false
        })
    );

    const apolloServer = new ApolloServer({
        typeDefs: fs.readFileSync(
            path.join(dirname(fileURLToPath(import.meta.url)), "../schema.graphql"),
            "utf8"
        ),
        resolvers: {
            ...resolvers,
            Upload: GraphQLUpload
        },
        context
    });

    await apolloServer.start();

    app.use(graphqlUploadExpress());
    apolloServer.applyMiddleware({ app });

    app.listen(port, () => {
        console.log(`Teruko-Server listening on port ${port}`);
        console.log(`GraphQL on ${apolloServer.graphqlPath}`);
    });
})();
