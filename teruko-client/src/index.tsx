import { ApolloProvider } from "@apollo/client";
import { render } from "preact";
import { BrowserRouter } from "react-router-dom";

import apolloClient from "./apolloClient";
import App from "./App";
import "./fonts";
import "./styles.css";

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
  app,
);
