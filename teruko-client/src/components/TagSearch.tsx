import clsx from "clsx";
import { FunctionComponent, JSX } from "preact";
import { useCallback, useState } from "preact/hooks";

import useSuggestions from "../hooks/useSuggestions";
import { Tag } from "../models";

const TagSearch: FunctionComponent<{
  tags: string[];
  setTags: (tags: string[]) => void;
}> = ({ tags, setTags }) => {
  const [tagsInput, setTagsInput] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  const suggestions = useSuggestions(tagsInput);

  const handleSubmit = useCallback((tagSlug: string) => {
    if (tags.includes(tagSlug)) {
      return;
    }
    setTags([...(tags || []), tagSlug]);
    setTagsInput("");
    setActiveSuggestion(0);
    // handleSubmitParent();
  }, [setTags, tags]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case "Enter": {
        if (suggestions.length > activeSuggestion) {
          handleSubmit(suggestions[activeSuggestion].slug);
        }

        break;
      }
      case "ArrowUp": {
        setActiveSuggestion(activeSuggestion - 1);

        break;
      }
      case "ArrowDown": {
        setActiveSuggestion(activeSuggestion + 1);

        break;
      }
      case "Escape": {
        setTags([]);

        break;
      }
        // No default
    }
  }, [
    activeSuggestion,
    handleSubmit,
    setTags,
    suggestions,
  ]);

  return (
    <div className="relative md:flex-grow md:mr-1">
      <input
        className="w-full"
        onInput={(event: JSX.TargetedEvent<HTMLInputElement>) => {
          setTagsInput((event.target as HTMLInputElement).value);
          setActiveSuggestion(0);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        type="text"
        value={tagsInput}
      />
      {suggestions.length > 0 && (
        <ul className="block absolute z-20 bg-neutral-700 left-0 right-0 p-1 rounded">
          {suggestions.map(({ slug: suggestion, ...tag }: Tag, index: number) => (
            <li
              className={clsx("p-1 cursor-pointer rounded-sm", { "bg-indigo-700 text-white": index === activeSuggestion })}
              key={suggestion}
              onClick={() => handleSubmit(suggestion)}
              onMouseEnter={() => setActiveSuggestion(index)}
              style={{
                backgroundColor: (index === activeSuggestion && tag.category && tag.category.color) || undefined,
                color: (index !== activeSuggestion && tag.category && tag.category.color) || undefined,
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagSearch;
