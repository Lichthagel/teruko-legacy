import React, { FunctionComponent, useMemo, useState } from "react";
import { GET_TAG_SUGGESTIONS } from "../queries/tag";
import { useQuery } from "@apollo/client";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const TagSearch: FunctionComponent<{
    tags: string[];
    setTags: (tags: string[]) => void;
}> = ({ tags, setTags }) => {

    const [tagsInput, setTagsInput] = useState("");

    const { data, loading } = useQuery(GET_TAG_SUGGESTIONS, {
        variables: {
            filter: tagsInput
        },
        skip: tagsInput.length < 3
    });

    const suggestions: string[] = useMemo(() => {
        if (data) {
            return (data.tagSuggestions as { slug: string }[]).map(tag => tag.slug);
        } else {
            return [];
        }
    }, [data]);

    return (
        <Autocomplete
            sx={{ m: 1 }}
            multiple
            id="tags-standard"
            value={tags}
            onChange={(event: unknown, newValue) => {
                setTags(newValue);
            }}
            options={suggestions}
            filterOptions={x => x}
            limitTags={3}
            loading={loading}
            clearOnEscape
            fullWidth
            forcePopupIcon={false}
            renderInput={(params) =>
                <TextField
                    {...params}
                    label="Tags"
                    value={tagsInput}
                    onChange={(event) => setTagsInput(event.target.value)} />
            } />
    );
};

export default TagSearch;