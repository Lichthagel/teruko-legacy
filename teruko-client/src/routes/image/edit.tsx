import { ADD_TAG, REMOVE_TAG } from "../../queries/tag";
import { ArrowLeftIcon, DownloadIcon, TrashIcon } from "@heroicons/react/outline";
import React, { FormEvent, Fragment, useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Tag from "../../components/Tag";
import TagInput from "../../components/TagInput";
import LoadingIcon from "../../components/LoadingIcon";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DELETE_IMAGE, GET_IMAGE, UPDATE_IMAGE, UPDATE_IMAGE_PIXIV } from "../../queries/image";
import clsx from "clsx";

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
        skip: !id
    });

    useEffect(() => {
        if (data.image) {
            setTitle(data.image.title || "");
            setSource(data.image.source || "");
        }
    }, [data.image]);

    const [updateImage, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_IMAGE);

    const [updateImagePixiv, { loading: loadingFetchPixiv }] = useMutation(UPDATE_IMAGE_PIXIV, {
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
                id: cache.identify(result.data),
                fields(fieldValue, details) {
                    return details.DELETE;
                }
            });
        }
    });

    const [addTag] = useMutation(ADD_TAG, {
        refetchQueries: ["TagSuggestions"]
    });

    const [removeTag] = useMutation(REMOVE_TAG, {
        refetchQueries: ["TagSuggestions"],
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

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateImage({
            variables: {
                id,
                title: title !== "" ? title : undefined,
                source: source !== "" ? source : undefined
            }
        });
    }, [id, source, title, updateImage]);

    return (
        <Fragment>
            <div className="flex flex-row items-center">
                <Link to={{ pathname: `/${id}`, search: `?${searchParams.toString()}` }} replace>
                    <ArrowLeftIcon className="w-8 h-8" />
                </Link>
                <div className="flex-grow"></div>
                <LoadingIcon loading={loadingFetchPixiv} className={"w-8 h-8"}>
                    <DownloadIcon
                        className={clsx("w-8 h-8 cursor-pointer", { "animate-pulse": loadingFetchPixiv })}
                        onClick={() => {
                            updateImagePixiv({
                                variables: {
                                    id
                                }
                            });
                        }} />
                </LoadingIcon>
                <LoadingIcon loading={deleteLoading} className={"w-8 h-8"}>
                    <TrashIcon
                        className="w-8 h-8 cursor-pointer"
                        onClick={() => {
                            if (confirm("Delete?")) {
                                deleteImage()
                                    .then(() => {
                                        navigate("/");
                                    });
                            }
                        }} />
                </LoadingIcon>
            </div>

            {!loading && data &&
                <div className="flex flex-col md:flex-row">
                    <form className="m-3 flex flex-col" onSubmit={handleSubmit}>
                        <div>
                            <h3>Title</h3>
                            <input
                                type="text"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                className="w-96 outline-none" />
                        </div>
                        <div>
                            <h3>Source</h3>
                            <input
                                type="text"
                                value={source}
                                onChange={(event) => setSource(event.target.value)}
                                className="w-96 outline-none" />
                        </div>
                        <button type="submit" className="my-5">{updateLoading ? "..." : updateError ? "error" : "update"}</button>
                    </form>
                    <div className="flex-grow">
                        <h1>Tags</h1>
                        <div>
                            {data.image.tags.map((tag: { slug:string }) =>
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
        </Fragment>
    );
};

export default EditImage;
