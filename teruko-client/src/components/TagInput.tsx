import { FunctionComponent, useCallback, useState } from "react";
import clsx from "clsx";
import useSuggestions from "../hooks/useSuggestions";

const TagInput: FunctionComponent<{
    handleSubmit: (slug: string) => void;
}> = ({ handleSubmit: handleSubmitParent }) => {

    const [tagInput, setTagInput] = useState("");
    const [activeSuggestion, setActiveSuggestion] = useState(0);

    const suggestions = useSuggestions(tagInput);

    const handleSubmit = useCallback((tagSlug: string) => {
        setTagInput("");
        setActiveSuggestion(0);
        handleSubmitParent(tagSlug);
    }, [handleSubmitParent]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (suggestions.length >= activeSuggestion) {
                if (activeSuggestion === 0) {
                    handleSubmit(tagInput);
                } else {
                    handleSubmit(suggestions[activeSuggestion - 1].slug);
                }
            }
        } else if (event.key === "ArrowUp") {
            setActiveSuggestion(activeSuggestion - 1);
        } else if (event.key === "ArrowDown") {
            setActiveSuggestion(activeSuggestion + 1);
        }
    }, [activeSuggestion, handleSubmit, suggestions, tagInput]);

    return (
        <div className="relative inline-block z-10 p-1">
            <input
                type="text"
                placeholder="Add tag..."
                className="!pt-1 !pb-[calc(0.20rem)] !px-2 !h-auto !border-b-[0.05rem] !border-t-0 !border-l-0 !border-r-0 !border-indigo-500 dark:!placeholder-indigo-500"
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
                        className={clsx("p-1 cursor-pointer", { "bg-indigo-700 text-white": activeSuggestion === 0 })}
                        onClick={() => handleSubmit(tagInput)}
                        onMouseEnter={() => setActiveSuggestion(0)}>
                        {tagInput}
                    </li>
                    {suggestions.map(({ slug: suggestion }: { slug: string }, index: number) =>
                        <li
                            key={suggestion}
                            className={clsx("p-1 cursor-pointer", { "bg-indigo-700 text-white": index + 1 === activeSuggestion })}
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