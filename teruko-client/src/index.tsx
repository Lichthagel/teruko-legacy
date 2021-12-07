import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import "virtual:windi.css";
import "./styles.css";
import apolloClient from "./apolloClient";

const app = document.getElementById("app");

ReactDOM.render(
    <ApolloProvider client={apolloClient}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ApolloProvider>,
    app
);