import React, { FunctionComponent } from "react";
import SortToggle from "./SortToggle";
import TagSearch from "./TagSearch";
import { useApolloClient } from "@apollo/client";
import { default as RefreshIcon } from "@mui/icons-material/Refresh";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";

const Nav: FunctionComponent<{
    tags: string[];
    setTags: (tags: string[]) => void;
}> = ({ tags, setTags }) => {

    const apolloClient = useApolloClient();

    return (
        <Stack
            direction="row"
            spacing={1}
            alignItems="center">
            <TagSearch tags={tags} setTags={setTags} />
            <SortToggle />
            <IconButton
                size="large"
                onClick={() => {
                    apolloClient.refetchQueries({
                        include: ["Images"]
                    });
                }}>
                <RefreshIcon />
            </IconButton>
        </Stack>
    );
};

export default Nav;