import { Fragment, useCallback, useMemo } from "react";
import { GET_IMAGE, GET_IMAGES } from "../../queries/image";
import { PencilIcon } from "@heroicons/react/outline";
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

    const next: ImageModel | undefined = useMemo(() => {
        if (data && dataImages) {
            const images: ImageModel[] = dataImages.images;
            if (images.length > 0) {
                const index = images.findIndex((el) => el.id === data.image.id);
                console.log(index);
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

    const goNext = useCallback(async () => {
        if (next) {
            navigate({
                pathname: `/${next.id}`,
                search: `?sort=${sort}${tags.map(tag => `&tag=${tag}`).join("")}`
            });
        }
    }, [navigate, next, sort, tags]);

    return (
        <div className="flex flex-col items-center">
            {!loading && data &&
                <Fragment>
                    <LoaderImage
                        src={`http://${window.location.hostname}:3030/img/${data.image.filename}`}
                        alt={data.image.title || data.image.id}
                        className="max-w-full h-auto max-h-90vh cursor-pointer"
                        onClick={goNext} />

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
