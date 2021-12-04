import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client/core";

const NEW_IMAGE = gql`
mutation ($files: [Upload!]!) {
    createImage(files: $files) { 
        id
    } 
}
`;

const NEW_IMAGE_FROM_PIXIV = gql`
mutation ($url: String!) {
    createImageFromPixiv(url: $url) {
        id
    }
}
`;

function newImage(url: string, client: ApolloClient<NormalizedCacheObject>, open: boolean) {
    GM_xmlhttpRequest({
        method: "GET",
        url,
        headers: {
            Referer: "https://www.pixiv.net/"
        },
        responseType: "blob",
        onload: res => {
            const blob = res.response;
            const file = new File(
                [blob],
                url.split("/").slice(-1)[0],
                {
                    type: blob.type
                }
            );

            client.mutate({
                mutation: NEW_IMAGE,
                variables: {
                    files: [file]
                }
            }).then(result => {
                if (result.data) {
                    if (open)
                        window.open(`http://192.168.1.178:3000/${result.data.createImage[0].id}`, "_blank");
                    else
                        alert(`uploaded (id: ${result.data.createImage[0].id})`);
                } else {
                    alert(`error: ${result}`);
                }
            })
                .catch(error => {
                    alert(`error: ${error}`);
                });

        }
    });

    /*client.mutate({
        mutation: NEW_IMAGE_FROM_PIXIV,
        variables: {
            url
        }
    }).then(result => {
        if (result.data) {
            alert(`uploaded (ids: ${result.data.createImageFromPixiv.map(image => image.id).join(", ")})`);
        } else {
            alert(`error: ${result}`);
        }
    })
        .catch(error => {
            alert(`error: ${error}`);
        });*/
}

export default newImage;