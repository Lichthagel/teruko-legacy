import Gallery from "../components/Gallery";
import Nav from "../components/Nav";
import { useSearchParams } from "react-router-dom";

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const tags = searchParams.getAll("tag");
    const sort = searchParams.get("sort") || "newest";

    return (
        <div>
            <Nav
                tags={tags}
                setTags={(tags: string[]) => {
                    setSearchParams({
                        ...searchParams,
                        tag: tags
                    });
                }} />

            <Gallery tags={tags} sort={sort as string} />
        </div>
    );
};

export default Home;