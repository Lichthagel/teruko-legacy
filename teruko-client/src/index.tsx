import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import "./fonts";
import "./styles.css";
import apolloClient from "./apolloClient";
import { render } from "preact";

const app = document.querySelector("#app");

if (!app) {
    throw new Error("Could not find app element");
}

render(
    <ApolloProvider client={apolloClient}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ApolloProvider>,
    app
);