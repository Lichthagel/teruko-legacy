import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { createUploadLink } from "apollo-upload-client";
import newImage from "./newImage";
import "./style.css";

const client = new ApolloClient({
    link: createUploadLink({
        uri: "http://192.168.1.178:3030/graphql"
    }),
    cache: new InMemoryCache()
});

/*document.addEventListener("keydown", (event) => {
    if (event.key !== "d") return;

    newImage(window.location.href, client);
});*/


let timeout: number | undefined;


const observer = new MutationObserver(async () => {

    clearTimeout(timeout);

    timeout = setTimeout(() => {
        document.querySelectorAll("div[role=presentation] > a.gtm-expand-full-size-illust").forEach((node: HTMLLinkElement) => {
            if (node.querySelector(".terukoButton")) return;

            //const img = node.querySelector("img");

            //if(!img) return;

            const dlButton = document.createElement("div");
            dlButton.classList.add("terukoButton");
            dlButton.textContent = "teruko";
            dlButton.addEventListener("click", (event) => {

                event.stopPropagation();
                event.preventDefault();
                newImage(node.href, client, event.shiftKey, event.target as HTMLDivElement);
            });

            node.append(dlButton);

            console.log("added button");
        });
    }, 20);
});

observer.observe(document.body, { childList: true, subtree: true });