import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import "./fonts";
import "./styles.css";
import apolloClient from "./apolloClient";
import { render } from "preact";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const app = document.getElementById("app")!;

render(
    <ApolloProvider client={apolloClient}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ApolloProvider>,
    app
);