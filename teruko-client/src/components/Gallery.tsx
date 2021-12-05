import { ApolloQueryResult, useQuery } from "@apollo/client";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GET_IMAGES } from "../queries/image";
import ImageCard from "./ImageCard";
import ImageCardSkeleton from "./ImageCardSkeleton";

const DEFAULT_TAKE = 12;

export const GallerySkeletonLoader: FunctionComponent = () =>
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: ".25rem", gridTemplateRows: "masonry" }}>
        <ImageCardSkeleton />
        <ImageCardSkeleton />
        <ImageCardSkeleton />
        <ImageCardSkeleton />
        <ImageCardSkeleton />
        <ImageCardSkeleton />
    </Box>;

const Gallery: FunctionComponent<{
    tags: string[];
    sort: string;
}> = ({ tags, sort }) => {
    const navigate = useNavigate();

    const [take, setTake] = useState(DEFAULT_TAKE);

    const { loading, error, data, fetchMore } = useQuery(GET_IMAGES, {
        variables: {
            skip: 0,
            take,
            sort,
            tags
        },
        notifyOnNetworkStatusChange: true
    });

    const loadMore = useCallback(() => {
        const currentLength = data.images.length;
        fetchMore({ variables: { skip: currentLength, take: DEFAULT_TAKE } })
            .then((fetchMoreResult: ApolloQueryResult<unknown>) => {
                setTake(currentLength + (fetchMoreResult.data as { images: unknown[] }).images.length);
            });
    }, [data, fetchMore]);

    const handleImageClick = useCallback((imageId, imageIndex) => {
        navigate({
            pathname: `/${imageId}`,
            search: `?skip=${imageIndex}&sort=${sort}${tags.map(tag => `&tag=${tag}`).join("")}`
        });
    }, [navigate, sort, tags]);

    useEffect(() => {
        setTake(12);
    }, [tags]);

    if (loading && !data) {
        return <GallerySkeletonLoader />;
    }

    if (error) {
        return <Alert severity="error">
            <AlertTitle>{error.name}</AlertTitle>
            {error.message}
        </Alert>;
    }

    if (!data) {
        return <Alert severity="error">Could not receive data.</Alert>;
    }


    return (
        <Stack>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(1,minmax(0,1fr))", md: "repeat(2,minmax(0,1fr))", xl: "repeat(3,minmax(0,1fr))" }, gap: ".25rem", gridTemplateRows: "masonry" }}>
                {data.images.map((image: { id: number; title: string; filename: string; tags: { slug: string; category?: { color?: string } }[] }, index: number) =>
                    <ImageCard
                        onClick={() => handleImageClick(image.id, index)}
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${image.id}_${index}`}
                        image={image} />)}
                <Box sx={{ display: "flex", height: "8rem", alignItems: "center", justifyContent: "center", marginBottom: "3rem" }}>
                    <Button
                        size="large"
                        onClick={loadMore}
                        disabled={loading}>Load more</Button>
                </Box>
            </Box>

        </Stack>
    );
};

export default Gallery;