import { useMutation, useQuery } from "@apollo/client";
import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DELETE_IMAGE, GET_IMAGE, UPDATE_IMAGE, UPDATE_IMAGE_PIXIV } from "../queries/image";
import { default as CheckIcon } from "@mui/icons-material/Check";
import { default as CloseIcon } from "@mui/icons-material/Close";
import { default as DeleteIcon } from "@mui/icons-material/Delete";
import { default as SyncIcon } from "@mui/icons-material/Sync";
import ConfirmDialog from "./ConfirmDialog";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";

const ImageEditDialog: FunctionComponent<{ open: boolean; setOpen:(open: boolean) => void; id: number }> = ({ open, setOpen, id }) => {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [source, setSource] = useState("");

    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const { loading, data } = useQuery(GET_IMAGE, {
        variables: {
            id
        },
        skip: !id
    });

    useEffect(() => {
        if (data && data.image) {
            setTitle(data.image.title || "");
            setSource(data.image.source || "");
        }
    }, [data]);

    const [updateImage, { loading: loadingUpdate }] = useMutation(UPDATE_IMAGE);

    const [updateImagePixiv, { loading: loadingFetchPixiv }] = useMutation(UPDATE_IMAGE_PIXIV, {
        variables: {
            id
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    const [deleteImage, { loading: deleteLoading }] = useMutation(DELETE_IMAGE, {
        variables: {
            id
        },
        refetchQueries: ["Images", "Next", "ImageCount"],
        update(cache, result) {
            if (!result.data) return;
            cache.modify({
                id: cache.identify(result.data),
                fields(fieldValue, details) {
                    return details.DELETE;
                }
            });
        }
    });

    const handleSubmit = useCallback(() => {
        updateImage({
            variables: {
                id,
                title: title !== "" ? title : null,
                source: source !== "" ? source : null
            }
        })
            .then((res) => {
                if (!res.errors) setOpen(false);
            });
    }, [
        id,
        setOpen,
        source,
        title,
        updateImage
    ]);

    if (loading) {
        return <Backdrop open sx={{ zIndex: 20 }}>
            <CircularProgress color="inherit" />
        </Backdrop>;
    }

    return <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Image</DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                label="Image Title"
                fullWidth
                margin="normal"
                value={title}
                onChange={event => setTitle(event.target.value)} />
            <TextField
                label="Image Source"
                fullWidth
                margin="normal"
                value={source}
                onChange={event => setSource(event.target.value)} />
        </DialogContent>
        <DialogActions>
            <Button
                startIcon={<SyncIcon />}
                disabled={loadingFetchPixiv}
                onClick={() => {
                    updateImagePixiv()
                        .then((res) => {
                            if (!res.errors) setOpen(false);
                        });
                }}>Fetch Pixiv</Button>
            <Button
                color="error"
                disabled={deleteLoading}
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteConfirm(true)}>Delete</Button>
            <Button
                color="success"
                disabled={loadingUpdate}
                startIcon={<CheckIcon />}
                onClick={handleSubmit}>Confirm</Button>
        </DialogActions>
        <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500]
            }}>
            <CloseIcon />
        </IconButton>
        <ConfirmDialog open={deleteConfirm}
            setOpen={setDeleteConfirm}
            text={"Are you sure you want to delete this image?"}
            onConfirm={() => {
                deleteImage()
                    .then(() => navigate("/"));
            }} />
    </Dialog>;
};

export default ImageEditDialog;