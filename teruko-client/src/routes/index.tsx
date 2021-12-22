import Gallery from "../components/Gallery";
import Search from "../components/Search";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_IMAGE_COUNT } from "../queries/image";
import { FunctionComponent } from "preact";

const Home: FunctionComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const tags = searchParams.getAll("tag");
    const sort = searchParams.get("sort") || "newest";

    const { data: dataCount } = useQuery(GET_IMAGE_COUNT, {
        pollInterval: 300000 // 5 mins
    });

    return (
        <div className="relative mt-6">
            <Search
                tags={tags}
                setTags={(tags: string[]) => {
                    setSearchParams({
                        tag: tags,
                        sort
                    });
                }} />

            {dataCount && <div className="absolute right-3 -top-5 text-gray-600 hidden md:block">{dataCount.imageCount} images</div>}

            <Gallery tags={tags} sort={sort as string} />
        </div>
    );
};

export default Home;