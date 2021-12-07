import { useQuery } from "@apollo/client";
import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GET_IMAGES } from "../queries/image";
import ImageCard from "./ImageCard";
import { Image } from "../models";

const DEFAULT_TAKE = 12;

export const GallerySkeletonLoader: FunctionComponent = () =>
    <div>
        <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 animate-pulse"
            style={{
                gridTemplateRows: "masonry"
            }}>
            <div className="w-full h-72 block bg-gray-700" />
            <div className="w-full h-96 block bg-gray-700" />
            <div className="w-full h-80 block bg-gray-700" />
            <div className="w-full h-96 block bg-gray-700" />
            <div className="w-full h-96 block bg-gray-700" />
            <div className="w-full h-80 block bg-gray-700" />
            <div className="w-full h-96 block bg-gray-700" />
            <div className="w-full h-40 block bg-gray-700" />
        </div>
    </div>;


const Gallery: FunctionComponent<{
    tags: string[];
    sort: string;
}> = ({ tags, sort }) => {
    const navigate = useNavigate();

    const { loading, error, data, fetchMore } = useQuery(GET_IMAGES, {
        variables: {
            skip: 0,
            take: DEFAULT_TAKE,
            sort,
            tags
        }
    });

    const loadMore = useCallback(() => {
        const currentLength = data.images.length;
        fetchMore({ variables: { skip: currentLength, take: DEFAULT_TAKE } });
    }, [data, fetchMore]);

    const handleImageClick = useCallback((imageId) => {
        navigate({
            pathname: `/${imageId}`,
            search: `?sort=${sort}${tags.map(tag => `&tag=${tag}`).join("")}`
        });
    }, [navigate, sort, tags]);

    /* useEffect(() => {
        const onScroll = () => {
            const {
                scrollTop,
                scrollHeight,
                clientHeight
            } = document.documentElement;

            if (scrollTop + clientHeight >= scrollHeight - 100) {
                loadMore();
            }
        };

        window.addEventListener("scroll", onScroll);

        return () => window.removeEventListener("scroll", onScroll);
    }, [loadMore]);*/

    if (loading) {
        return <GallerySkeletonLoader />;
    }

    if (error) {
        return <h1>{`Error: ${error}`}</h1>;
    }

    if (!data) {
        return <h1>unknown error</h1>;
    }


    return (
        <div>
            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1"
                style={{
                    gridTemplateRows: "masonry"
                }}>
                {data.images.map((image: Image, index: number) => <ImageCard
                    onClick={() => handleImageClick(image.id)}
                    filterTags={tag => tags.indexOf(tag.slug) === -1}
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${image.id}_${index}`}
                    image={image} />)}
            </div>
            <div className="flex h-32 items-center justify-center mb-12">
                <button className="text-indigo-800 dark:text-indigo-400 border-2 rounded-md border-indigo-800 dark:border-indigo-400 px-6 text-xl inline-flex items-center h-10 leading-10 cursor-pointer transition-all hover:text-darkpurple hover:bg-indigo-400" onClick={loadMore}>Load more</button>
            </div>
        </div>
    );
};

export default Gallery;