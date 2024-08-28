import clsx from "clsx";
import { FunctionComponent, JSX } from "preact";
import { useCallback, useState } from "preact/hooks";

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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case "Enter": {
        if (suggestions.length >= activeSuggestion) {
          if (activeSuggestion === 0) {
            handleSubmit(tagInput);
          } else {
            handleSubmit(suggestions[activeSuggestion - 1].slug);
          }
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
        // No default
    }
  }, [
    activeSuggestion,
    handleSubmit,
    suggestions,
    tagInput,
  ]);

  return (
    <div className="relative inline-block z-10 p-1">
      <input
        className="!pt-1 !pb-[calc(0.20rem)] !px-2 !h-auto !border-b-[0.05rem] !border-t-0 !border-l-0 !border-r-0 !border-indigo-500 dark:!placeholder-indigo-500"
        onInput={(event: JSX.TargetedEvent<HTMLInputElement>) => {
          setTagInput((event.target as HTMLInputElement).value);
          setActiveSuggestion(0);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Add tag..."
        type="text"
        value={tagInput}
      />
      {tagInput.length > 0 && (
        <ul className="block absolute z-20 bg-gray-700 left-0 right-0">
          <li
            className={clsx("p-1 cursor-pointer", { "bg-indigo-700 text-white": activeSuggestion === 0 })}
            key="new_tag"
            onClick={() => handleSubmit(tagInput)}
            onMouseEnter={() => setActiveSuggestion(0)}
          >
            {tagInput}
          </li>
          {suggestions.map(({ slug: suggestion }: { slug: string }, index: number) => (
            <li
              className={clsx("p-1 cursor-pointer", { "bg-indigo-700 text-white": index + 1 === activeSuggestion })}
              key={suggestion}
              onClick={() => handleSubmit(suggestion)}
              onMouseEnter={() => setActiveSuggestion(index + 1)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagInput;
