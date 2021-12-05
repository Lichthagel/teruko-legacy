import React, { useCallback, useState } from "react";
import { GET_IMAGE, GET_NEXT } from "../queries/image";
import { useQuery } from "@apollo/client";
import LoaderImage from "../components/LoaderImage";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { default as EditIcon } from "@mui/icons-material/Edit";
import ImageEditDialog from "../components/ImageEditDialog";
import ImageTagsDialog from "../components/ImageTagsDialog";

const ListItem = styled("li")(({ theme }) => ({
    margin: theme.spacing(0.5)
}));

const Image = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();

    const id = parseInt(params.id as string);
    const skip = parseInt(searchParams.get("skip") || "-1");
    const tags = searchParams.getAll("tag");
    const sort = searchParams.get("sort") || "newest";

    const [editOpen, setEditOpen] = useState(false);
    const [tagsOpen, setTagsOpen] = useState(false);

    const { loading, data } = useQuery(GET_IMAGE, {
        variables: {
            id
        },
        skip: isNaN(id)
    });

    const { data: nextData } = useQuery(GET_NEXT, {
        variables: {
            skip: skip + 1, // TODO
            sort,
            tags
        }
    });

    const goNext = useCallback(async () => {
        if (nextData && nextData.images.length > 0) {
            navigate({
                pathname: `/${nextData.images[0].id}`,
                search: `?sort=${sort}&skip=${skip + 1}${tags.map(tag => `&tag=${tag}`).join("")}`
            });
        }
    }, [
        navigate,
        nextData,
        skip,
        sort,
        tags
    ]);

    if (loading) {
        return <Backdrop open>
            <CircularProgress />
        </Backdrop>;
    }

    if (!data) {
        return null;
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center">
            <LoaderImage
                src={`http://${window.location.hostname}:3030/img/${data.image.filename}`}
                // width={data.image.width}
                // height={data.image.height}
                alt={data.image.title || data.image.id}
                style={{
                    maxWidth: "100%",
                    height: "auto",
                    maxHeight: "90vh",
                    cursor: "pointer"
                }}
                onClick={goNext} />

            <Stack sx={{ my: 3 }}>
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center">
                    <Typography
                        variant="h4"
                        component="div"
                        flexGrow="1"
                        color={data.image.title ? "inherit" : "text.secondary"}>{data.image.title || "No title"}</Typography>
                    <IconButton size="large" onClick={() => setEditOpen(true)}>
                        <EditIcon />
                    </IconButton>
                </Stack>

                {data.image.source ?
                    <Box>
                        <Typography variant="body1" component="span" color="text.secondary">Source: </Typography>
                        <MuiLink
                            target="_blank"
                            href={data.image.source}
                            rel="noreferrer"
                            underline="none">{data.image.source}</MuiLink>
                    </Box>
                    :
                    <Typography variant="body1" component="span" color="text.secondary">No source</Typography>
                }

            </Stack>

            <Paper sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", listStyle: "none", p: 0.5, m: 0 }} component="ul">
                {data.image.tags.map((tag: { slug: string; category?: { color?: string } }) =>
                    <ListItem key={tag.slug}>
                        <Link to={{ pathname: `/tag/${encodeURIComponent(tag.slug)}` }} key={tag.slug}>
                            <Chip label={tag.slug} clickable sx={{ bgcolor: tag.category && tag.category.color }} />
                        </Link>
                    </ListItem>)}
                <ListItem>
                    <IconButton onClick={() => setTagsOpen(true)}>
                        <EditIcon />
                    </IconButton>
                </ListItem>
            </Paper>

            <ImageEditDialog open={editOpen} setOpen={setEditOpen} id={id} />
            <ImageTagsDialog open={tagsOpen} setOpen={setTagsOpen} id={id} />
        </Box>
    );
};

export default Image;
