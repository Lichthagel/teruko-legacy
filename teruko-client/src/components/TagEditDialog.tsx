import { useMutation, useQuery } from "@apollo/client";
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { default as CheckIcon } from "@mui/icons-material/Check";
import { default as CloseIcon } from "@mui/icons-material/Close";
import { default as DeleteIcon } from "@mui/icons-material/Delete";
import { DELETE_TAG, GET_TAG, UPDATE_TAG } from "../queries/tag";
import { GET_TAG_CATEGORIES } from "../queries/category";
import ConfirmDialog from "./ConfirmDialog";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Autocomplete from "@mui/material/Autocomplete";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

const TagEditDialog: FunctionComponent<{ open: boolean; setOpen:(open: boolean) => void; slug: string }> = ({ open, setOpen, slug }) => {
    const navigate = useNavigate();

    const [newSlug, setNewSlug] = useState("");
    const [category, setCategory] = useState("");

    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const { loading, data } = useQuery(GET_TAG, {
        variables: {
            slug
        },
        skip: !slug
    });

    useEffect(() => {
        if (data && data.tag) {
            setNewSlug(data.tag.slug);
            setCategory(data.tag.category && data.tag.category.slug || "");
        }
    }, [data]);

    const { data: dataCategories } = useQuery(GET_TAG_CATEGORIES);

    const tagCategories = useMemo(() => {
        if (dataCategories) {
            return dataCategories.tagCategories.map((cat: { slug: string }) => cat.slug);
        } else {
            return [];
        }
    }, [dataCategories]);

    const [updateTag, { loading: loadingUpdate }] = useMutation(UPDATE_TAG, {
        refetchQueries: ["Image", "Images", "Next", "TagSuggestions"]
    });

    const [deleteTag, { loading: loadingDelete }] = useMutation(DELETE_TAG, {
        variables: {
            slug
        },
        update(cache, result) {
            cache.modify({
                id: cache.identify(result.data),
                fields(fieldValue, details) {
                    return details.DELETE;
                }
            });
        }
    });

    const handleSubmit = useCallback(() => {
        updateTag({
            variables: {
                slug,
                newSlug: newSlug !== slug ? newSlug : undefined,
                category: category !== "" ? category : null
            }
        }).then(result => {
            if (result.data) {
                navigate(`/tag/${encodeURIComponent(result.data.updateTag.slug)}`, { replace: true });
            }
        });
    }, [
        category,
        navigate,
        newSlug,
        slug,
        updateTag
    ]);

    if (loading) {
        return <Backdrop open sx={{ zIndex: 20 }}>
            <CircularProgress color="inherit" />
        </Backdrop>;
    }

    return <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Tag</DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                label="Tag Slug"
                fullWidth
                margin="normal"
                value={newSlug}
                onChange={event => setNewSlug(event.target.value)} />
            <Autocomplete
                freeSolo
                includeInputInList
                selectOnFocus
                options={tagCategories}
                value={category}
                onChange={(event, newValue) => setCategory(newValue || "")}
                renderInput={(params) => <TextField
                    {...params}
                    label="Tag Category"
                    fullWidth
                    margin="normal" />} />
        </DialogContent>
        <DialogActions>
            <Button
                color="error"
                disabled={loadingDelete}
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
        <ConfirmDialog
            open={deleteConfirm}
            setOpen={setDeleteConfirm}
            text={"Are you sure you want to delete this tag?"}
            onConfirm={() => {
                deleteTag()
                    .then(() => navigate("/"));
            }} />
    </Dialog>;
};

export default TagEditDialog;