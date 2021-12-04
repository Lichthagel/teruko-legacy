import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client/core";

const NEW_IMAGE_FROM_PIXIV = gql`
mutation ($url: String!) {
    createImageFromPixiv(url: $url) {
        id
    }
}
`;

function newImage(url: string, client: ApolloClient<NormalizedCacheObject>) {
    client.mutate({
        mutation: NEW_IMAGE_FROM_PIXIV,
        variables: {
            url
        }
    }).then((result: { data: { createImageFromPixiv: any[]; }; }) => {
        if (result.data) {
            alert(`uploaded (ids: ${result.data.createImageFromPixiv.map(image => image.id).join(", ")})`);
        } else {
            alert(`error: ${result}`);
        }
    })
        .catch((error: Error) => {
            alert(`error: ${error}`);
        });
}

export default newImage;