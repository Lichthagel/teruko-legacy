import { useApolloClient } from "@apollo/client";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { FunctionComponent } from "preact";
import { createPortal } from "preact/compat";
import { useCallback } from "preact/hooks";
import { useNavigate } from "react-router-dom";

import SortToggle from "./SortToggle";
import TagQuery from "./TagQuery";
import TagSearch from "./TagSearch";

const Search: FunctionComponent<{
  tags: string[];
  setTags: (tags: string[]) => void;
}> = ({ tags, setTags }) => {
  const navigate = useNavigate();

  const apolloClient = useApolloClient();

  const removeTag = useCallback((tagSlug: string) => {
    navigate("/");
    const newTags = tags.filter((el) => el !== tagSlug);
    setTags(newTags);
  }, [navigate, setTags, tags]);

  const resetTags = useCallback(() => {
    navigate("/");
    setTags([]);
  }, [navigate, setTags]);

  const navContent = document.querySelector("#navContent");

  if (!navContent) {
    return;
  }

  return (
    <>
      {createPortal(
        <div className="w-full px-3 mx-auto">
          <div className="inline-block">
            {tags?.map((slug) => <TagQuery key={slug} onClick={() => removeTag(slug)} slug={slug} />)}
            {tags && tags.length > 0 && (
              <div
                className="inline-block bg-red-700 text-white h-8 leading-8 px-2 rounded cursor-pointer mr-1"
                key="resetButton"
                onClick={resetTags}
              >
                reset
              </div>
            )}
          </div>
          <div className="inline-flex flex-col md:flex-row w-auto my-1 items-center">
            <TagSearch setTags={setTags} tags={tags} />
            <SortToggle />
            <ArrowPathIcon
              className="w-10 h-10 cursor-pointer"
              onClick={() => {
                void apolloClient.refetchQueries({
                  include: ["Images"],
                });
              }}
            />
          </div>
        </div>
        , navContent,
      )}
    </>
  );
};

export default Search;
