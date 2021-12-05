import { CheckIcon, PencilIcon, TrashIcon, XIcon } from "@heroicons/react/outline";
import { DELETE_TAG, GET_TAG, UPDATE_TAG } from "../queries/tag";
import React, { FormEvent, Fragment, FunctionComponent, useCallback, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Button from "../components/Button";
import Gallery from "../components/Gallery";
import SortToggle from "../components/SortToggle";
import LoadingIcon from "../components/LoadingIcon";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { GET_TAG_CATEGORIES } from "../queries/category";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EditHeading: FunctionComponent<{ slug: string; data: any; setEdit: (edit: boolean) => void }> = ({ slug, data, setEdit }) => {
    const navigate = useNavigate();

    const [newSlug, setNewSlug] = useState(slug);
    const [category, setCategory] = useState(data.tag.category && data.tag.category.slug || "");

    const { data: dataCategories } = useQuery(GET_TAG_CATEGORIES);

    const [updateTag, { loading: loadingUpdate }] = useMutation(UPDATE_TAG, {
        refetchQueries: ["TagSuggestions"],
        update(cache, result) {
            if (!result.data) return;
            cache.modify({
                id: cache.identify({
                    __typename: "Tag",
                    slug: slug
                }),
                fields: {
                    slug: () => result.data.slug,
                    category: () => result.data.category
                }
            });
        }
    });

    const [deleteTag, { loading: loadingDelete }] = useMutation(DELETE_TAG, {
        variables: {
            slug
        },
        update(cache, result) {
            cache.modify({
                id: cache.identify(result.data),
                fields(fieldValue, details) {
                    return details.DELETE;
                }
            });
        }
    });

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateTag({
            variables: {
                slug,
                newSlug: newSlug !== slug ? newSlug : undefined,
                category: category !== "" ? category : null
            }
        }).then(result => {
            if (result.data) {
                navigate(`/tag/${encodeURIComponent(result.data.updateTag.slug)}`, { replace: true });
            }
            setEdit(false);
        });
    }, [
        category,
        navigate,
        newSlug,
        setEdit,
        slug,
        updateTag
    ]);



    return (
        <form className="flex flex-col md:flex-row items-center" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="slug"
                value={newSlug}
                onChange={(event) => setNewSlug(event.target.value)}
                className="text-3xl mr-3 break-all outline-none bg-transparent border-none focus:bg-gray-700 p-1" />
            <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-96 h-8 rounded">
                <option value={""}>-</option>
                {dataCategories && dataCategories.tagCategories.map((category: { slug:string }) =>
                    <option key={category.slug} value={category.slug}>{category.slug}</option>)}
            </select>
            <LoadingIcon loading={loadingUpdate} className="w-8 h-8">
                <button type="submit">
                    <CheckIcon className="w-8 h-8" />
                </button>
            </LoadingIcon>
            <LoadingIcon loading={loadingDelete} className="w-8 h-8">
                <TrashIcon
                    className="w-8 h-8 cursor-pointer"
                    onClick={() => {
                        if (confirm("Delete?")) {
                            deleteTag()
                                .then(() => {
                                    navigate("/");
                                });
                        }
                    }} />
            </LoadingIcon>
            <XIcon className="w-8 h-8 cursor-pointer" onClick={() => setEdit(false)} />
        </form>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Heading: FunctionComponent<{ slug: string; loading: boolean; data: any }> = ({ slug, loading, data }) => {

    const [edit, setEdit] = useState(false);

    if (!edit) {
        return (
            <Fragment>
                <h1 className="text-3xl mr-3 break-all p-1">{slug}</h1>
                {loading && <Button text="..." />}
                {data && data.tag && data.tag.category &&
                    <Button text={data.tag.category.slug} color={data.tag.category.color} />
                }
                <PencilIcon className="w-8 h-8 cursor-pointer" onClick={() => setEdit(true)} />
            </Fragment>
        );
    }

    if (!data) return null;

    return <EditHeading
        slug={slug}
        data={data}
        setEdit={setEdit} />;

};

const Tag = () => {
    const params = useParams();
    const [searchParams] = useSearchParams();

    const slug = params.slug as string;
    const sort = searchParams.get("sort") || "newest";

    const { loading, data } = useQuery(GET_TAG, {
        variables: {
            slug
        },
        skip: !slug
    });

    return (
        <Fragment>
            <div className="my-3 flex flex-row items-center">
                <Heading loading={loading} data={data} slug={slug} />
                <div className="flex-grow"></div>
                <SortToggle />
            </div>

            {slug && <Gallery tags={[slug]} sort={sort as string} />}
        </Fragment>
    );
};

export default Tag;