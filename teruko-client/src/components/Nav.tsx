import { FunctionComponent, useCallback } from "react";
import { RefreshIcon } from "@heroicons/react/outline";
import SortToggle from "./SortToggle";
import TagSearch from "./TagSearch";
import { useApolloClient } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import TagQuery from "./TagQuery";

const Nav: FunctionComponent<{
    tags: string[];
    setTags: (tags: string[]) => void;
}> = ({ tags, setTags }) => {

    const navigate = useNavigate();

    const apolloClient = useApolloClient();

    const removeTag = useCallback(async (tagSlug: string) => {
        navigate("/");
        const newTags = tags.filter(el => el !== tagSlug);
        setTags(newTags);
    }, [navigate, setTags, tags]);

    const resetTags = useCallback(async () => {
        navigate("/");
        setTags([]);
    }, [navigate, setTags]);

    return (
        <div className="w-full md:w-2/3 lg:w-1/2 px-3 mx-auto mt-3 mb-5 z-10">
            <div className="flex flex-col md:flex-row w-full mb-1 items-center">
                <TagSearch tags={tags} setTags={setTags} />
                <SortToggle />
                <RefreshIcon
                    className="w-10 h-10 cursor-pointer"
                    onClick={() => {
                        apolloClient.refetchQueries({
                            include: ["Images"]
                        });
                    }} />
            </div>
            <div>
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
        </div>
    );
};

export default Nav;