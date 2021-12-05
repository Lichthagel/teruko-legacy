import Gallery from "../components/Gallery";
import Nav from "../components/Nav";
import { useSearchParams } from "react-router-dom";
import React from "react";
import Box from "@mui/material/Box";

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const tags = searchParams.getAll("tag");
    const sort = searchParams.get("sort") || "newest";

    return (
        <Box>
            <Nav
                tags={tags}
                setTags={(tags: string[]) => {
                    setSearchParams({
                        ...searchParams,
                        tag: tags
                    });
                }} />

            <Gallery tags={tags} sort={sort as string} />
        </Box>
    );
};

export default Home;