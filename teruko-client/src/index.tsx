import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { ThemeProvider } from "@mui/material";
import theme from "./siteTheme";
import apolloClient from "./apolloClient";

const app = document.getElementById("app");

ReactDOM.render(
    <ApolloProvider client={apolloClient}>
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </ApolloProvider>,
    app
);