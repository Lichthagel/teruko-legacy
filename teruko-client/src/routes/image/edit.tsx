import { ADD_TAG, REMOVE_TAG } from "../../queries/tag";
import { ArrowLeftIcon, DownloadIcon, TrashIcon } from "@heroicons/react/outline";
import { useMutation, useQuery } from "@apollo/client";
import Tag from "../../components/Tag";
import TagInput from "../../components/TagInput";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DELETE_IMAGE, GET_IMAGE, UPDATE_IMAGE, UPDATE_IMAGE_PIXIV } from "../../queries/image";
import IconButton from "../../components/IconButton";
import LoadingIconButton from "../../components/LoadingIconButton";
import { useCallback, useEffect, useState } from "preact/hooks";
import { JSX } from "preact";

const EditImage = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();

    const id = parseInt(params.id as string);

    const [title, setTitle] = useState("");
    const [source, setSource] = useState("");

    const { loading, data } = useQuery(GET_IMAGE, {
        variables: {
            id
        },
        skip: !id,
        nextFetchPolicy: "cache-only"
    });

    useEffect(() => {
        if (data && data.image) {
            setTitle(data.image.title || "");
            setSource(data.image.source || "");
        }
    }, [data]);

    const [updateImage, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_IMAGE);

    const [updateImagePixiv, { loading: loadingFetchPixiv }] = useMutation(UPDATE_IMAGE_PIXIV, {
        refetchQueries: ["TagSuggestions"],
        onError: (error) => {
            alert(error.message);
        }
    });

    const [deleteImage, { loading: deleteLoading }] = useMutation(DELETE_IMAGE, {
        variables: {
            id
        },
        refetchQueries: ["ImageCount"],
        update(cache, result) {
            if (!result.data) return;

            cache.modify({
                id: cache.identify(result.data.deleteImage),
                fields(fieldValue, details) {
                    return details.DELETE;
                }
            });
        }
    });

    const [addTag] = useMutation(ADD_TAG, {
        refetchQueries: ["TagSuggestions"],
        update(cache, _, context) {
            if (!context.variables) return;
            cache.modify({
                id: cache.identify({
                    __typename: "Tag",
                    slug: context.variables.tag
                }),
                fields: {
                    count: (fieldValue, details) => details.INVALIDATE
                }
            });
        }
    });

    const [removeTag] = useMutation(REMOVE_TAG, {
        update(cache, _, context) {
            if (!context.variables) return;
            cache.modify({
                id: cache.identify({
                    __typename: "Tag",
                    slug: context.variables.tag
                }),
                fields(fieldValue, details) {
                    return details.INVALIDATE;
                }
            });
        }
    });

    const handleSubmit = useCallback((event: JSX.TargetedEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateImage({
            variables: {
                id,
                title: title !== "" ? title : undefined,
                source: source !== "" ? source : undefined
            }
        });
    }, [id, source, title, updateImage]);

    const handleDelete = useCallback(() => {
        if (confirm("Delete?")) {
            deleteImage()
                .then(() => {
                    const next = searchParams.get("next");

                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.delete("next");

                    navigate({
                        pathname: next ? `/${next}` : "/",
                        search: `?${newSearchParams.toString()}`
                    }, {
                        replace: true
                    });
                });
        }
    }, [deleteImage, navigate, searchParams]);

    const handleUpdatePixiv = useCallback(() => {
        updateImagePixiv({
            variables: {
                id
            }
        });
    }, [id, updateImagePixiv]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.code === "Escape") {
                event.preventDefault();
                navigate({
                    pathname: `/${id}`,
                    search: searchParams.toString()
                });
            } else if (event.ctrlKey && event.code === "KeyD") {
                event.preventDefault();
                handleDelete();
            } else if (event.ctrlKey && event.code === "KeyP") {
                event.preventDefault();
                handleUpdatePixiv();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [
        handleDelete,
        handleUpdatePixiv,
        id,
        navigate,
        searchParams
    ]);

    return (
        <div className="max-w-2xl mx-auto rounded-md bg-neutral-200 dark:bg-neutral-800 p-2 mt-20 shadow-md dark:shadow-indigo-800">
            <div className="flex flex-row items-center">
                <Link to={{ pathname: `/${id}`, search: `?${searchParams.toString()}` }} replace>
                    <IconButton>
                        <ArrowLeftIcon />
                    </IconButton>
                </Link>
                <div className="flex-grow"></div>
                <LoadingIconButton
                    loading={loadingFetchPixiv}
                    onClick={handleUpdatePixiv}>
                    <DownloadIcon />
                </LoadingIconButton>
                <LoadingIconButton
                    loading={deleteLoading}
                    onClick={handleDelete}>
                    <TrashIcon />
                </LoadingIconButton>
            </div>

            {!loading && data &&
                <div>
                    <form className="mx-auto my-3 flex flex-col w-max" onSubmit={handleSubmit}>
                        <div>
                            <h3>Title</h3>
                            <input
                                type="text"
                                value={title}
                                onInput={(event: JSX.TargetedEvent<HTMLInputElement>) => setTitle((event.target as HTMLInputElement).value)}
                                className="w-96 outline-none" />
                        </div>
                        <div>
                            <h3>Source</h3>
                            <input
                                type="text"
                                value={source}
                                onInput={(event: JSX.TargetedEvent<HTMLInputElement>) => setSource((event.target as HTMLInputElement).value)}
                                className="w-96 outline-none" />
                        </div>
                        <button type="submit" className="my-5">{updateLoading ? "..." : updateError ? "error" : "update"}</button>
                    </form>
                    <div className="flex-grow">
                        <h1>Tags</h1>
                        <div>
                            {data && data.image && data.image.tags && data.image.tags.map((tag: { slug:string }) =>
                                <Tag
                                    key={tag.slug}
                                    tag={tag}
                                    onClick={
                                        () => removeTag({
                                            variables: {
                                                imageId: id,
                                                tag: tag.slug
                                            }
                                        })
                                    } />)}
                            <TagInput handleSubmit={slug => {
                                addTag({
                                    variables: {
                                        imageId: id,
                                        tag: slug
                                    }
                                });
                            }} />
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default EditImage;
