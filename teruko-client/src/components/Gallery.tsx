import { useQuery } from "@apollo/client";
import { GET_IMAGES } from "../queries/image";
import ImageCard from "./ImageCard";
import { Image } from "../models";
import { FunctionComponent } from "preact";
import { useCallback, useEffect } from "preact/hooks";

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
    const { loading, error, data, fetchMore } = useQuery(GET_IMAGES, {
        variables: {
            skip: 0,
            take: DEFAULT_TAKE,
            sort,
            tags
        },
        pollInterval: sort === "random" ? 0 : 60000
    });

    const loadMore = useCallback(() => {
        fetchMore({ variables: { skip: data.images.length } });
    }, [data, fetchMore]);

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

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (document.activeElement && document.activeElement.tagName.toUpperCase() === "INPUT") return;

            if (event.code === "Space") {
                event.preventDefault();
                loadMore();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [loadMore]);

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
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${image.id}_${index}`}
                    filterTags={tag => tags.indexOf(tag.slug) === -1}
                    image={image}
                    url={{
                        pathname: `/${image.id}`,
                        search: `?sort=${sort}${tags.map(tag => `&tag=${tag}`).join("")}`
                    }} />)}
            </div>
            <div className="flex h-32 items-center justify-center mb-12">
                <button className="text-indigo-800 dark:text-indigo-400 border-2 rounded-md border-indigo-800 dark:border-indigo-400 px-6 text-xl inline-flex items-center h-10 leading-10 cursor-pointer transition-all hover:text-neutral-800 hover:bg-indigo-400" onClick={loadMore}>Load more</button>
            </div>
        </div>
    );
};

export default Gallery;