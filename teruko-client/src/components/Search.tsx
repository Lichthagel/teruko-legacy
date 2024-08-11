import { ArrowPathIcon } from "@heroicons/react/24/outline";
import SortToggle from "./SortToggle";
import TagSearch from "./TagSearch";
import { useApolloClient } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import TagQuery from "./TagQuery";
import { FunctionComponent } from "preact";
import { useCallback } from "preact/hooks";
import { createPortal } from "preact/compat";

const Search: FunctionComponent<{
    tags: string[];
    setTags: (tags: string[]) => void;
}> = ({ tags, setTags }) => {

    const navigate = useNavigate();

    const apolloClient = useApolloClient();

    const removeTag = useCallback((tagSlug: string) => {
        navigate("/");
        const newTags = tags.filter(el => el !== tagSlug);
        setTags(newTags);
    }, [navigate, setTags, tags]);

    const resetTags = useCallback(() => {
        navigate("/");
        setTags([]);
    }, [navigate, setTags]);

    const navContent = document.querySelector("#navContent");

    if (!navContent) return;

    return <>{createPortal(
        <div className="w-full px-3 mx-auto">
            <div className="inline-block">
                {tags?.map(slug => <TagQuery key={slug} slug={slug} onClick={() => removeTag(slug)} />)}
                {tags && tags.length > 0 &&
                    <div
                        key="resetButton"
                        className="inline-block bg-red-700 text-white h-8 leading-8 px-2 rounded cursor-pointer mr-1"
                        onClick={resetTags}>
                        reset
                    </div>
                }
            </div>
            <div className="inline-flex flex-col md:flex-row w-auto my-1 items-center">
                <TagSearch tags={tags} setTags={setTags} />
                <SortToggle />
                <ArrowPathIcon
                    className="w-10 h-10 cursor-pointer"
                    onClick={() => {
                        void apolloClient.refetchQueries({
                            include: ["Images"]
                        });
                    }} />
            </div>
        </div>
        , navContent
    )}</>;
};

export default Search;