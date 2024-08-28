import { useQuery } from "@apollo/client";
import { FunctionComponent } from "preact";
import { useSearchParams } from "react-router-dom";

import Gallery from "../components/Gallery";
import Search from "../components/Search";
import { GET_IMAGE_COUNT } from "../queries/image";

const Home: FunctionComponent = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tags = searchParams.getAll("tag");
  const sort = searchParams.get("sort") || "newest";

  const { data: dataCount } = useQuery<{ imageCount: number }>(GET_IMAGE_COUNT, {
    pollInterval: 300_000, // 5 mins
  });

  return (
    <div className="relative mt-6 container mx-auto">
      <Search
        setTags={(tags: string[]) => {
          setSearchParams({
            tag: tags,
            sort,
          });
        }}
        tags={tags}
      />

      {dataCount && (
        <div className="absolute right-3 -top-5 text-gray-600 hidden md:block">
          {dataCount.imageCount}
          {" "}
          images
        </div>
      )}

      <Gallery sort={sort} tags={tags} />
    </div>
  );
};

export default Home;
