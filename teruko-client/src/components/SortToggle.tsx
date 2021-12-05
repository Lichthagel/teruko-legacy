import { FunctionComponent, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const SortToggle: FunctionComponent = () => {

    const [searchParams, setSearchParams] = useSearchParams();

    const sort = searchParams.get("sort") || "newest";
    // const sort = router.query.sort || "newest";

    const setSort = useCallback((sort: string) => {
        setSearchParams({
            sort
        }); // TODO
        /* router.replace({
            query: {
                ...router.query,
                sort
            }
        });*/
    }, [setSearchParams]);

    return (
        <select
            className="rounded h-8 md:mr-1"
            value={sort}
            onChange={(event) => {
                setSort(event.target.value);
            }}>
            <option value="newest">newest</option>
            <option value="oldest">oldest</option>
            <option value="last_updated">last updated</option>
            <option value="random">random</option>
        </select>
    );
};

export default SortToggle;