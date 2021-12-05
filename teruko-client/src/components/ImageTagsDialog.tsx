import { useMutation, useQuery } from "@apollo/client";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { GET_IMAGE, UPDATE_IMAGE_PIXIV } from "../queries/image";
import { default as CloseIcon } from "@mui/icons-material/Close";
import { default as DeleteIcon } from "@mui/icons-material/Delete";
import { default as SyncIcon } from "@mui/icons-material/Sync";
import { ADD_TAG, GET_TAG_SUGGESTIONS, REMOVE_TAG } from "../queries/tag";
import { styled } from "@mui/material/styles";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

const ListItem = styled("li")(({ theme }) => ({
    margin: theme.spacing(0.5)
}));

const ImageEditDialog: FunctionComponent<{ open: boolean; setOpen:(open: boolean) => void; id: number }> = ({ open, setOpen, id }) => {
    const [tagInput, setTagInput] = useState("");

    const { loading, data } = useQuery(GET_IMAGE, {
        variables: {
            id
        },
        skip: !id
    });

    const { data: dataSuggestions } = useQuery(GET_TAG_SUGGESTIONS, {
        variables: {
            filter: tagInput
        },
        skip: tagInput.length < 3
    });

    const suggestions: string[] = useMemo(() => {
        if (dataSuggestions) {
            return (dataSuggestions.tagSuggestions as { slug: string }[]).map(tag => tag.slug);
        } else {
            return [];
        }
    }, [dataSuggestions]);

    const [updateImagePixiv, { loading: loadingFetchPixiv }] = useMutation(UPDATE_IMAGE_PIXIV, {
        variables: {
            id
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    const [addTag] = useMutation(ADD_TAG, {
        refetchQueries: ["TagSuggestions"]
    });

    const [removeTag] = useMutation(REMOVE_TAG, {
        refetchQueries: ["TagSuggestions"],
        update(cache, _, context) {
            if (!context.variables) return;
            cache.modify({
                id: cache.identify({
                    __typename: "Tag",
                    slug: context.variables.tag
                }),
                fields(fieldValue, details) {
                    return details.INVALIDATE;
                }
            });
        }
    });

    useEffect(() => {
        if (data && data.image) {
            return;
        }
    }, [data]);

    if (loading) {
        return <Backdrop open sx={{ zIndex: 20 }}>
            <CircularProgress color="inherit" />
        </Backdrop>;
    }

    return <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Image</DialogTitle>
        <DialogContent>
            <Paper sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", listStyle: "none", p: 0.5, m: 0 }} component="ul">
                {data.image.tags.map((tag: { slug: string; category?: { color?: string } }) =>
                    <ListItem key={tag.slug}>
                        <Chip
                            label={tag.slug}
                            sx={{ bgcolor: tag.category && tag.category.color }}
                            deleteIcon={<DeleteIcon />}
                            onDelete={() => removeTag({
                                variables: {
                                    imageId: id,
                                    tag: tag.slug
                                }
                            })} />
                    </ListItem>)}
            </Paper>
            <Autocomplete
                freeSolo
                clearOnBlur
                blurOnSelect
                options={suggestions}
                filterOptions={x => x}
                onChange={(event, newValue) => {
                    if (newValue !== "") {
                        addTag({
                            variables: {
                                imageId: id,
                                tag: newValue
                            }
                        }).then((res) => {
                            if (!res.errors) {
                                setTagInput("");
                            }
                        });
                    }
                }}
                forcePopupIcon={false}
                renderInput={(params) =>
                    <TextField
                        {...params}
                        label="Search"
                        margin="normal"
                        value={tagInput}
                        onChange={event => setTagInput(event.target.value)}
                        InputProps={{
                            ...params.InputProps,
                            type: "search"
                        }} />
                } />
        </DialogContent>
        <DialogActions>
            <Button
                startIcon={<SyncIcon />}
                disabled={loadingFetchPixiv}
                onClick={() => updateImagePixiv()}>Fetch Pixiv</Button>
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
    </Dialog>;
};

export default ImageEditDialog;