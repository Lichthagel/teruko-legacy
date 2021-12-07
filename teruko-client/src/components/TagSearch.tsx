import { FunctionComponent, useCallback, useState } from "react";
import clsx from "clsx";
import { Tag } from "../models";
import useSuggestions from "../hooks/useSuggestions";

const TagSearch: FunctionComponent<{
    tags: string[];
    setTags: (tags: string[]) => void;
}> = ({ tags, setTags }) => {

    const [tagsInput, setTagsInput] = useState("");
    const [activeSuggestion, setActiveSuggestion] = useState(0);

    const suggestions = useSuggestions(tagsInput);

    const handleSubmit = useCallback((tagSlug: string) => {
        if (tags.find((el) => el === tagSlug)) return;
        setTags((tags || []).concat([tagSlug]));
        setTagsInput("");
        setActiveSuggestion(0);
        // handleSubmitParent();
    }, [setTags, tags]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (suggestions.length > activeSuggestion) {
                handleSubmit(suggestions[activeSuggestion].slug);
            }
        } else if (event.key === "ArrowUp") {
            setActiveSuggestion(activeSuggestion - 1);
        } else if (event.key === "ArrowDown") {
            setActiveSuggestion(activeSuggestion + 1);
        } else if (event.key === "Escape") {
            setTags([]);
        }
    }, [activeSuggestion, handleSubmit, setTags, suggestions]);

    return (
        <div className="relative md:flex-grow md:mr-1">
            <input
                type="text"
                placeholder="Search..."
                className="w-full"
                value={tagsInput}
                onChange={(event) => {
                    setTagsInput(event.target.value);
                    setActiveSuggestion(0);
                }}
                onKeyDown={handleKeyDown} />
            {suggestions.length > 0 &&
            <ul className="block absolute z-20 bg-dark-600 left-0 right-0 p-1 rounded">
                {suggestions.map(({ slug: suggestion, ...tag }: Tag, index: number) =>
                    <li
                        key={suggestion}
                        className={clsx("p-1 cursor-pointer rounded-sm", { "bg-indigo-700 text-white": index === activeSuggestion })}
                        onClick={() => handleSubmit(suggestion)}
                        onMouseEnter={() => setActiveSuggestion(index)}
                        style={{
                            backgroundColor: index === activeSuggestion && tag.category && tag.category.color || undefined,
                            color: index !== activeSuggestion && tag.category && tag.category.color || undefined
                        }}>
                        {suggestion}
                    </li>)}
            </ul>
            }
        </div>
    );
};

export default TagSearch;