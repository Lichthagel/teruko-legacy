import React, { useCallback, useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { NEW_IMAGE, NEW_IMAGE_FROM_PIXIV } from "../queries/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

const New = () => {
    const navigate = useNavigate();

    const [pixivUrl, setPixivUrl] = useState("");

    const [newImage, { loading, error }] = useMutation(NEW_IMAGE, {
        refetchQueries: ["Images", "GetNext", "ImageCount"],
        onError(error) {
            alert(`Error: ${error.message}`);
        }
    });

    const [newImageFromPixiv, { loading: loadingPixiv, error: errorPixiv }] = useMutation(NEW_IMAGE_FROM_PIXIV, {
        variables: {
            url: pixivUrl
        },
        refetchQueries: ["Images", "GetNext", "ImageCount"],
        onError(error) {
            alert(`Error: ${error.message}`);
        }
    });

    const handleDragOver = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();

        if (!loading && !error) {
            event.dataTransfer.dropEffect = "copy";
        }
    }, [error, loading]);

    const handleDrop = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();

        if (!loading && !error) {
            newImage({
                variables: {
                    files: event.dataTransfer.files
                }
            })
                .then(() => {
                    navigate("/");
                });
        }


    }, [error, loading, navigate, newImage]);

    const handlePixiv = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.stopPropagation();
        event.preventDefault();

        if (pixivUrl !== "" && !loadingPixiv && !errorPixiv) {
            newImageFromPixiv().then(() => navigate("/"));
        }
    }, [
        errorPixiv,
        loadingPixiv,
        navigate,
        newImageFromPixiv,
        pixivUrl
    ]);

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <Box
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                sx={{
                    width: "100%",
                    height: 300,
                    borderWidth: 4,
                    borderStyle: "dashed",
                    borderColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                <Typography variant="h2" component="div">{!loading ? "drop image here" : "..."}</Typography>
            </Box>

            <form onSubmit={handlePixiv} style={{ width: "100%" }}>
                <TextField
                    label="or enter a pixiv URL"
                    disabled={loadingPixiv}
                    value={pixivUrl}
                    onChange={(event) => setPixivUrl(event.target.value)}
                    margin="normal"
                    fullWidth />
            </form>
        </Box>
    );
};

export default New;
