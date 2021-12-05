import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React, { FunctionComponent, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const SortToggle: FunctionComponent = () => {

    const [searchParams, setSearchParams] = useSearchParams();

    const sort = searchParams.get("sort") || "newest";

    const setSort = useCallback((sort: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("sort", sort);
        setSearchParams(newSearchParams);
    }, [searchParams, setSearchParams]);

    return (
        <FormControl sx={{ m: 1, width: 200 }}>
            <InputLabel>Sort</InputLabel>
            <Select
                value={sort}
                label="Sort"
                autoWidth
                onChange={(event) => setSort(event.target.value)}>
                <MenuItem value="newest">newest</MenuItem>
                <MenuItem value="oldest">oldest</MenuItem>
                <MenuItem value="last_updated">last updated</MenuItem>
                <MenuItem value="random">random</MenuItem>
            </Select>
        </FormControl>
    );
};

export default SortToggle;