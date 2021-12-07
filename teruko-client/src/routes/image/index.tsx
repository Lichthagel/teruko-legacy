import React, { Fragment, useCallback, useMemo } from "react";
import { GET_IMAGE, GET_IMAGES } from "../../queries/image";
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon } from "@heroicons/react/outline";
import Tag from "../../components/Tag";
import { useQuery } from "@apollo/client";
import LoaderImage from "../../components/LoaderImage";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { Image as ImageModel } from "../../models";

const Image = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();

    const id = parseInt(params.id as string);
    const tags = searchParams.getAll("tag");
    const sort = searchParams.get("sort") || "newest";

    const { loading, data } = useQuery(GET_IMAGE, {
        variables: {
            id
        },
        skip: isNaN(id)
    });

    const { data: dataImages, fetchMore } = useQuery(GET_IMAGES, {
        variables: {
            skip: 0,
            take: 1,
            sort,
            tags
        }
    });

    const previous: ImageModel | undefined = useMemo(() => {
        if (data && dataImages) {
            const images: ImageModel[] = dataImages.images;
            if (images.length > 0) {
                const index = images.findIndex((el) => el.id === data.image.id);
                if (index !== -1) {
                    if (index - 1 < 0) {
                        return;
                    } else {
                        return images[index + 1];
                    }
                } else {
                    return images[0];
                }
            }
        }
    }, [data, dataImages]);

    const next: ImageModel | undefined = useMemo(() => {
        if (data && dataImages) {
            const images: ImageModel[] = dataImages.images;
            if (images.length > 0) {
                const index = images.findIndex((el) => el.id === data.image.id);
                if (index !== -1) {
                    if (index + 1 >= images.length) {
                        fetchMore({
                            variables: {
                                skip: images.length,
                                take: 1,
                                sort,
                                tags
                            }
                        });
                    } else {
                        return images[index + 1];
                    }
                } else {
                    return images[0];
                }
            }
        }
    }, [
        data,
        dataImages,
        fetchMore,
        sort,
        tags
    ]);

    const goPrevious = useCallback(async () => {
        if (previous) {
            navigate({
                pathname: `/${previous.id}`,
                search: `?sort=${sort}${tags.map(tag => `&tag=${tag}`).join("")}`
            }, { replace: true });
        }
    }, [navigate, previous, sort, tags]);

    const goNext = useCallback(async () => {
        if (next) {
            navigate({
                pathname: `/${next.id}`,
                search: `?sort=${sort}${tags.map(tag => `&tag=${tag}`).join("")}`
            }, { replace: true });
        }
    }, [navigate, next, sort, tags]);

    return (
        <div className="flex flex-col items-center">
            {!loading && data &&
                <Fragment>
                    <div className="w-full relative">
                        <LoaderImage
                            src={`http://${window.location.hostname}:3030/img/${data.image.filename}`}
                            alt={data.image.title || data.image.id}
                            className="max-w-full h-auto max-h-[100vh] mx-auto cursor-pointer"
                            onClick={goNext} />

                        <ChevronLeftIcon
                            onClick={goPrevious}
                            className="absolute w-20 h-20 z-20 left-0 bottom-[50%] transition hover:text-indigo-800 cursor-pointer" />

                        <ChevronRightIcon
                            onClick={goNext}
                            className="absolute w-20 h-20 z-20 right-0 bottom-[50%] transition hover:text-indigo-800 cursor-pointer" />
                    </div>

                    <div className="w-full my-3 p-1">
                        <div className="flex items-center">
                            {data.image.title ? <h1 className="text-3xl flex-grow">{data.image.title}</h1> : <h1 className="text-3xl flex-grow text-gray-500 dark:text-gray-400">No title</h1>}
                            <Link to={{ pathname: `/${id}/edit`, search: `?${searchParams.toString()}` }} replace>
                                <PencilIcon className="w-8 h-8" />
                            </Link>
                        </div>

                        {data.image.source ?
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Source: </span>
                                <a
                                    target="_blank"
                                    href={data.image.source}
                                    rel="noreferrer"
                                    className="text-blue-800 dark:text-blue-300 mb-3">{data.image.source}</a>
                            </div>
                            :
                            <p className="dark:text-gray-400 mb-3">No source</p>
                        }

                    </div>

                    <div className="w-full">
                        {data.image.tags.map((tag: { slug: string }) =>
                            <Link to={{ pathname: `/tag/${encodeURIComponent(tag.slug)}` }} key={tag.slug}>
                                <Tag tag={tag} />
                            </Link>)}
                    </div>
                </Fragment>
            }
        </div>
    );
};

export default Image;
