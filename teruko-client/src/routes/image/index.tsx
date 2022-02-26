import { GET_IMAGE, GET_IMAGES } from "../../queries/image";
import { ChevronLeftIcon, ChevronRightIcon, ClipboardCopyIcon, DownloadIcon, PencilIcon } from "@heroicons/react/outline";
import Tag from "../../components/Tag";
import { useQuery } from "@apollo/client";
import LoaderImage from "../../components/LoaderImage";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { Image as ImageModel } from "../../models";
import { useCallback, useEffect, useMemo } from "preact/hooks";
import { Fragment } from "preact";

const Image = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();

    const id = parseInt(params.id as string);
    const tags = searchParams.getAll("tag");
    const sort = searchParams.get("sort") || "random";

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

    const previous: ImageModel | null = useMemo(() => {
        if (data && dataImages) {
            const images: ImageModel[] = dataImages.images;
            if (images.length > 0) {
                const index = images.findIndex((el) => el.id === data.image.id);
                if (index !== -1) {
                    if (index > 0) {
                        return images[index - 1];
                    } else return null;
                } else return null;
            } else return null;
        } else return null;
    }, [data, dataImages]);

    const next: ImageModel | null = useMemo(() => {
        if (data && dataImages) {
            const images: ImageModel[] = dataImages.images;
            if (images.length > 0) {
                const index = images.findIndex((el) => el.id === data.image.id);
                if (index !== -1) {
                    if (index + 1 >= images.length) {
                        fetchMore({
                            variables: {
                                skip: images.length,
                                take: sort === "random" ? 3 : 1, // take 3 since although unlike one image might be one which was already fetched
                                sort,
                                tags
                            }
                        });
                        return null;
                    } else {
                        return images[index + 1];
                    }
                } else {
                    return images[0];
                }
            } else return null;
        } else return null;
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

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (document.activeElement && document.activeElement.tagName.toUpperCase() === "INPUT") return;

            if (event.code === "ArrowRight") {
                event.preventDefault();
                goNext();
            } else if (event.code === "ArrowLeft") {
                event.preventDefault();
                goPrevious();
            } else if (event.code === "Escape") {
                event.preventDefault();
                navigate({
                    pathname: "/",
                    search: searchParams.toString()
                });
            } else if (event.ctrlKey && event.code === "KeyE") {
                event.preventDefault();
                navigate({
                    pathname: `/${id}/edit`,
                    search: `${searchParams.toString()}${next ? `&next=${next.id}` : ""}`
                });
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [
        goNext,
        goPrevious,
        id,
        navigate,
        next,
        searchParams
    ]);

    const image: ImageModel | undefined = data && data.image || undefined;

    const fileExt = image?.filename.slice(image.filename.lastIndexOf(".") + 1);

    return (
        <div className="flex flex-col items-center">
            {!loading && image &&
                <Fragment>
                    <div className="w-full relative">
                        <LoaderImage
                            src={`http://${window.location.hostname}:3030/img/${data.image.filename}`}
                            alt={image.title || image.id.toString()}
                            className="max-w-full h-auto max-h-[100vh] mx-auto cursor-pointer shadow-xl shadow-indigo-400 dark:shadow-indigo-800"
                            onClick={goNext} />

                        <ChevronLeftIcon
                            onClick={goPrevious}
                            className="absolute w-20 h-20 z-20 left-0 bottom-[50%] transition hover:text-indigo-800 cursor-pointer" />

                        <ChevronRightIcon
                            onClick={goNext}
                            className="absolute w-20 h-20 z-20 right-0 bottom-[50%] transition hover:text-indigo-800 cursor-pointer" />
                    </div>

                    <div className="container mx-auto">
                        <div className="w-full my-4 p-1">
                            <div className="flex items-center">
                                {image.title ? <h1 className="text-3xl flex-grow overflow-hidden">{image.title}</h1> : <h1 className="text-3xl flex-grow text-gray-500 dark:text-gray-400 overflow-hidden">No title</h1>}
                                <div className="mx-2 text-indigo-500/80 dark:text-gray-400 text-sm text-right flex-shrink-0">
                                    <div><span className="font-light">Created At: </span>{new Date(image.createdAt).toLocaleString()}</div>
                                    <div><span className="font-light">Updated At: </span>{new Date(data.image.updatedAt).toLocaleString()}</div>
                                </div>
                                <a href={`http://${window.location.hostname}:3030/original/${image.id}`} className="flex-shrink-0 relative">
                                    <DownloadIcon className="w-10 h-10 mx-1" />
                                    <span className="absolute -bottom-1 right-0 text-[0.6rem] bg-indigo-600 rounded text-white font-bold uppercase px-1 shadow-sm shadow-indigo-600">{fileExt}</span>
                                </a>
                                {fileExt && fileExt !== "avif" && <a href={`http://${window.location.hostname}:3030/avif/${image.id}`} className="flex-shrink-0 relative">
                                    <DownloadIcon className="w-10 h-10 mx-1" />
                                    <span className="absolute -bottom-1 right-0 text-[0.6rem] bg-indigo-600 rounded text-white font-bold uppercase px-1 shadow-sm shadow-indigo-600">avif</span>
                                </a>}
                                <a href={`http://${window.location.hostname}:3030/webp/${image.id}`} className="flex-shrink-0 relative">
                                    <DownloadIcon className="w-10 h-10 mx-1" />
                                    <span className="absolute -bottom-1 right-0 text-[0.6rem] bg-indigo-600 rounded text-white font-bold uppercase px-1 shadow-sm shadow-indigo-600">webp</span>
                                </a>
                                <Link to={{ pathname: `/${id}/edit`, search: `?${searchParams.toString()}${next ? `&next=${next.id}` : ""}` }} replace className="flex-shrink-0">
                                    <PencilIcon className="w-8 h-8 mx-1" />
                                </Link>
                            </div>

                            {image.source ?
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Source: </span>
                                    <a
                                        target="_blank"
                                        href={image.source}
                                        rel="noreferrer"
                                        className="text-blue-800 dark:text-blue-300 mb-3">{image.source}</a>
                                    <ClipboardCopyIcon
                                        className="h-6 inline-block relative bottom-1 cursor-pointer transition-colors"
                                        onClick={(event: MouseEvent) => {
                                            if (window.navigator.clipboard) {
                                                window.navigator.clipboard.writeText(image.source ?? "")
                                                    .then(() => {
                                                        (event.target as SVGElement).classList.add("text-emerald-600");

                                                        setTimeout(() => {
                                                            (event.target as SVGElement).classList.remove("text-emerald-600");
                                                        }, 1000);
                                                    })
                                                    .catch((err) => alert(`could not copy: ${err}`));
                                            } else {
                                                alert(`insecure context - ${image.source}`);
                                            }
                                        }} />
                                </div>
                                :
                                <p className="dark:text-gray-400 mb-3">No source</p>
                            }

                        </div>

                        <div className="w-full">
                            {image.tags.map((tag: { slug: string }) =>
                                <Link to={{ pathname: `/tag/${encodeURIComponent(tag.slug)}` }} key={tag.slug}>
                                    <Tag tag={tag} />
                                </Link>)}
                        </div>
                    </div>
                </Fragment>
            }
        </div>
    );
};

export default Image;
