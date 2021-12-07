import Gallery from "../components/Gallery";
import Nav from "../components/Nav";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_IMAGE_COUNT } from "../queries/image";

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const tags = searchParams.getAll("tag");
    const sort = searchParams.get("sort") || "newest";

    const { data: dataCount } = useQuery(GET_IMAGE_COUNT);

    return (
        <div className="relative">
            <Nav
                tags={tags}
                setTags={(tags: string[]) => {
                    setSearchParams({
                        tag: tags,
                        sort
                    });
                }} />

            {dataCount && <div className="absolute right-3 top-3 text-gray-600">{dataCount.imageCount} images</div>}

            <Gallery tags={tags} sort={sort as string} />
        </div>
    );
};

export default Home;