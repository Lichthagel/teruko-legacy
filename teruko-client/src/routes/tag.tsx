import { GET_TAG } from "../queries/tag";
import React, { Fragment, useState } from "react";
import { useQuery } from "@apollo/client";
import Gallery from "../components/Gallery";
import SortToggle from "../components/SortToggle";
import { useParams, useSearchParams } from "react-router-dom";
import { default as EditIcon } from "@mui/icons-material/Edit";
import TagEditDialog from "../components/TagEditDialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";

const Tag = () => {
    const params = useParams();
    const [searchParams] = useSearchParams();

    const slug = params.slug as string;
    const sort = searchParams.get("sort") || "newest";

    const [editOpen, setEditOpen] = useState(false);

    const { loading, data } = useQuery(GET_TAG, {
        variables: {
            slug
        },
        skip: !slug
    });

    return (
        <Fragment>
            <Box display="flex" flexDirection="row" alignItems="center">
                <Typography variant="h4" component="span">{slug}</Typography>
                {loading && <Chip label="..." />}
                {data && data.tag && data.tag.category &&
                        <Chip label={data.tag.category.slug} sx={{ bgcolor: data.tag.category.color, mx: 2 }} />
                }
                <IconButton onClick={() => setEditOpen(true)}>
                    <EditIcon />
                </IconButton>
                <Box flexGrow={1}></Box>
                <SortToggle />
            </Box>

            {slug && <Gallery tags={[slug]} sort={sort as string} />}
            <TagEditDialog open={editOpen} setOpen={setEditOpen} slug={slug} />
        </Fragment>
    );
};

export default Tag;