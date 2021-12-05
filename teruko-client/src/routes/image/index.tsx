import { Fragment, useCallback } from "react";
import { GET_IMAGE, GET_NEXT } from "../../queries/image";
import { PencilIcon } from "@heroicons/react/outline";
import Tag from "../../components/Tag";
import { useQuery } from "@apollo/client";
import LoaderImage from "../../components/LoaderImage";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";

const Image = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();

    const id = parseInt(params.id as string);
    const skip = parseInt(searchParams.get("skip") || "-1");
    const tags = searchParams.getAll("tag");
    const sort = searchParams.get("sort") || "newest";

    const { loading, data } = useQuery(GET_IMAGE, {
        variables: {
            id
        },
        skip: isNaN(id)
    });

    const { data: nextData } = useQuery(GET_NEXT, {
        variables: {
            skip: skip + 1, // TODO
            sort,
            tags
        }
    });

    const goNext = useCallback(async () => {
        if (nextData && nextData.images.length > 0) {
            navigate({
                pathname: `/${nextData.images[0].id}`,
                search: `?sort=${sort}&skip=${skip + 1}${tags.map(tag => `&tag=${tag}`).join("")}`
            });
        }
    }, [
        navigate,
        nextData,
        skip,
        sort,
        tags
    ]);

    return (
        <div className="flex flex-col items-center">
            {!loading && data &&
                <Fragment>
                    <LoaderImage
                        src={`http://${window.location.hostname}:3030/img/${data.image.filename}`}
                        // width={data.image.width}
                        // height={data.image.height}
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
