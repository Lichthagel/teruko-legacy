import { FunctionComponent, JSX } from "preact";
import { useCallback } from "preact/hooks";
import { useSearchParams } from "react-router-dom";

const SortToggle: FunctionComponent = () => {

    const [searchParams, setSearchParams] = useSearchParams();

    const sort = searchParams.get("sort") || "newest";
    // const sort = router.query.sort || "newest";

    const setSort = useCallback((sort: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("sort", sort);
        setSearchParams(newSearchParams); // TODO
    }, [searchParams, setSearchParams]);

    return (
        <select
            className="md:mr-1 bg-darkpurple"
            value={sort}
            onInput={(event: JSX.TargetedEvent<HTMLSelectElement>) => {
                setSort((event.target as HTMLSelectElement).value);
            }}>
            <option value="newest">newest</option>
            <option value="oldest">oldest</option>
            <option value="last_updated">last updated</option>
            <option value="random">random</option>
        </select>
    );
};

export default SortToggle;