import { FunctionComponent, useCallback, useState } from "react";
import { GET_TAG_SUGGESTIONS } from "../queries/tag";
import { useQuery } from "@apollo/client";
import clsx from "clsx";

const TagSearch: FunctionComponent<{
    tags: string[];
    setTags: (tags: string[]) => void;
}> = ({ tags, setTags }) => {

    const [tagsInput, setTagsInput] = useState("");
    const [activeSuggestion, setActiveSuggestion] = useState(0);

    const { data } = useQuery(GET_TAG_SUGGESTIONS, {
        variables: {
            filter: tagsInput
        },
        skip: tagsInput.length < 3
    });

    const handleSubmit = useCallback((tagSlug: string) => {
        setTags((tags || []).concat([tagSlug]));
        setTagsInput("");
        setActiveSuggestion(0);
        // handleSubmitParent();
    }, [setTags, tags]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (data && data.tagSuggestions.length > activeSuggestion) {
                handleSubmit(data.tagSuggestions[activeSuggestion].slug);
            }
        } else if (event.key === "ArrowUp") {
            setActiveSuggestion(activeSuggestion - 1);
        } else if (event.key === "ArrowDown") {
            setActiveSuggestion(activeSuggestion + 1);
        } else if (event.key === "Escape") {
            setTags([]);
        }
    }, [activeSuggestion, data, handleSubmit, setTags]);

    return (
        <div className="relative md:flex-grow md:mr-1">
            <input
                type="text"
                placeholder="Search..."
                className="h-8 w-full outline-none"
                value={tagsInput}
                onChange={(event) => {
                    setTagsInput(event.target.value);
                    setActiveSuggestion(0);
                }}
                onKeyDown={handleKeyDown} />
            {data &&
                <ul className="block absolute z-20 bg-gray-700 left-0 right-0">
                    {data.tagSuggestions.map(({ slug: suggestion }: { slug: string }, index: number) =>
                        <li
                            key={suggestion}
                            className={clsx("p-1 cursor-pointer", { "bg-indigo-700 text-white": index === activeSuggestion })}
                            onClick={() => handleSubmit(suggestion)}
                            onMouseEnter={() => setActiveSuggestion(index)}>
                            {suggestion}
                        </li>)}
                </ul>
            }
        </div>
    );
};

export default TagSearch;