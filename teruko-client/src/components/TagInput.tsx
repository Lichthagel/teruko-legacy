import { FunctionComponent, useCallback, useState } from "react";
import { GET_TAG_SUGGESTIONS } from "../queries/tag";
import { useQuery } from "@apollo/client";
import classNames from "classnames";

const TagInput: FunctionComponent<{
    handleSubmit: (slug: string) => void;
}> = ({ handleSubmit: handleSubmitParent }) => {

    const [tagInput, setTagInput] = useState("");
    const [activeSuggestion, setActiveSuggestion] = useState(0);

    const { data } = useQuery(GET_TAG_SUGGESTIONS, {
        variables: {
            filter: tagInput
        },
        skip: tagInput.length < 3
    });

    const handleSubmit = useCallback((tagSlug: string) => {
        setTagInput("");
        setActiveSuggestion(0);
        handleSubmitParent(tagSlug);
    }, [handleSubmitParent]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (data && data.tagSuggestions.length >= activeSuggestion) {
                if (activeSuggestion === 0) {
                    handleSubmit(tagInput);
                } else {
                    handleSubmit(data.tagSuggestions[activeSuggestion - 1].slug);
                }
            }
        } else if (event.key === "ArrowUp") {
            setActiveSuggestion(activeSuggestion - 1);
        } else if (event.key === "ArrowDown") {
            setActiveSuggestion(activeSuggestion + 1);
        }
    }, [activeSuggestion, data, handleSubmit, tagInput]);

    return (
        <div className="relative inline-block z-10">
            <input
                type="text"
                placeholder="Add tag..."
                className="bg-transparent outline-none border-none dark:placeholder-indigo-600"
                value={tagInput}
                onChange={(event) => {
                    setTagInput(event.target.value);
                    setActiveSuggestion(0);
                }}
                onKeyDown={handleKeyDown} />
            {tagInput.length !== 0 &&
                <ul className="block absolute z-20 bg-gray-700 left-0 right-0">
                    <li
                        key={"new_tag"}
                        className={classNames("p-1 cursor-pointer", { "bg-indigo-700 text-white": activeSuggestion === 0 })}
                        onClick={() => handleSubmit(tagInput)}
                        onMouseEnter={() => setActiveSuggestion(0)}>
                        {tagInput}
                    </li>
                    {data && data.tagSuggestions.map(({ slug: suggestion }: { slug: string }, index: number) =>
                        <li
                            key={suggestion}
                            className={classNames("p-1 cursor-pointer", { "bg-indigo-700 text-white": index + 1 === activeSuggestion })}
                            onClick={() => handleSubmit(suggestion)}
                            onMouseEnter={() => setActiveSuggestion(index + 1)}>
                            {suggestion}
                        </li>)}
                </ul>
            }
        </div>
    );
};

export default TagInput;