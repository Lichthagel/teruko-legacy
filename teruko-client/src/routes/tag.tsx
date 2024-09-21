import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import {
  ArrowDownTrayIcon, ArrowPathIcon, CheckIcon, PencilIcon, TrashIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, FunctionComponent, JSX } from "preact";
import { useCallback, useState } from "preact/hooks";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import type { Tag, TagCategory } from "../models";

import Button from "../components/Button";
import Gallery from "../components/Gallery";
import LoadingIconButton from "../components/LoadingIconButton";
import SortToggle from "../components/SortToggle";
import { BASE_URL } from "../constants";
import { GET_TAG_CATEGORIES } from "../queries/category";
import { DELETE_TAG, GET_TAG, UPDATE_TAG } from "../queries/tag";

const EditHeading: FunctionComponent<{
  slug: string;
  data: {
    tag: Tag;
  };
  setEdit: (edit: boolean) => void;
}> = ({ slug, data, setEdit }) => {
  const navigate = useNavigate();

  const [newSlug, setNewSlug] = useState(slug);
  const [category, setCategory] = useState<string>((data.tag.category && data.tag.category.slug) || "");

  const { data: dataCategories } = useQuery<{ tagCategories: TagCategory[] }>(GET_TAG_CATEGORIES);

  const [updateTag, { loading: loadingUpdate }] = useMutation<{ updateTag: Tag }>(UPDATE_TAG, {
    refetchQueries: ["TagSuggestions"],
    update(cache, result) {
      if (!!result.data && slug !== result.data.updateTag.slug) {
        cache.modify({
          id: cache.identify({
            __typename: "Tag",
            slug,
          }),
          fields: {
            slug: () => result.data?.updateTag.slug,
            category: () => result.data?.updateTag.category,
          },
        });
      }
    },
  });

  const [deleteTag, { loading: loadingDelete }] = useMutation<{ deleteTag: { slug: string } }>(DELETE_TAG, {
    variables: {
      slug,
    },
    update(cache, result) {
      if (result.data) {
        cache.modify({
          id: cache.identify(result.data.deleteTag),
          fields(fieldValue, details) {
            return details.DELETE;
          },
        });
      }
    },
  });

  const handleSubmit = useCallback((event: JSX.TargetedEvent<HTMLFormElement>) => {
    event.preventDefault();
    void (async () => {
      const result = await updateTag({
        variables: {
          slug,
          newSlug: newSlug === slug ? undefined : newSlug,
          category: category === "" ? null : category,
        },
      });

      if (result.data) {
        navigate(`/tag/${encodeURIComponent(result.data.updateTag.slug)}`, { replace: true });
      }
      setEdit(false);
    })();
  }, [
    category,
    navigate,
    newSlug,
    setEdit,
    slug,
    updateTag,
  ]);

  return (
    <form className="flex flex-col md:flex-row items-center" onSubmit={handleSubmit}>
      <input
        className="text-3xl mr-3 break-all outline-none bg-transparent border-none focus:bg-gray-700 p-1"
        onInput={(event) => setNewSlug((event.target as HTMLInputElement).value)}
        placeholder="slug"
        type="text"
        value={newSlug}
      />
      <select
        className="w-96 h-8 rounded"
        onChange={(event) => setCategory((event.target as HTMLSelectElement).value)}
        value={category}
      >
        <option value="">-</option>
        {dataCategories && dataCategories.tagCategories.map((category: { slug: string }) =>

          <option key={category.slug} value={category.slug}>{category.slug}</option>)}
      </select>
      <LoadingIconButton className="w-8 h-8" loading={loadingUpdate}>
        <button type="submit">
          <CheckIcon className="w-8 h-8" />
        </button>
      </LoadingIconButton>
      <LoadingIconButton
        className="w-8 h-8"
        loading={loadingDelete}
        onClick={() => {
          if (confirm("Delete?")) {
            void (async () => {
              await deleteTag();
              navigate("/");
            })();
          }
        }}
      >
        <TrashIcon />
      </LoadingIconButton>
      <XMarkIcon className="w-8 h-8 cursor-pointer" onClick={() => setEdit(false)} />
    </form>
  );
};

const Heading: FunctionComponent<{ slug: string; loading: boolean; data: { tag?: Tag } }> = ({ slug, loading, data }) => {
  const [edit, setEdit] = useState(false);

  if (!edit) {
    return (
      <Fragment>
        <h1 className="text-3xl mr-3 break-all p-1">{slug}</h1>
        {loading && <Button text="..." />}
        {data && data.tag && data.tag.category &&
          <Button color={data.tag.category.color} text={data.tag.category.slug} />}
        <PencilIcon className="w-8 h-8 cursor-pointer" onClick={() => setEdit(true)} />
      </Fragment>
    );
  }

  return data && data.tag ?
      (
        <EditHeading
          data={data as { tag: Tag }}
          setEdit={setEdit}
          slug={slug}
        />
      ) :
    null;
};

const Tag = () => {
  const apolloClient = useApolloClient();

  const params = useParams();
  const [searchParams] = useSearchParams();

  const slug = params.slug;
  const sort = searchParams.get("sort") || "newest";

  const { loading, data } = useQuery<{ tag?: { count: number } & Tag }>(GET_TAG, {
    variables: {
      slug,
    },
    skip: !slug,
  });

  if (!slug) {
    return null;
  }

  if (!data || !data.tag) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <div className="my-3 flex flex-row items-center">
        <Heading data={data} loading={loading} slug={slug} />
        <div className="flex-grow" />
        {data && data.tag && (
          <div className="text-gray-600 hidden md:block mx-2">
            {data.tag.count}
            {" "}
            images
          </div>
        )}
        <a className="flex-shrink-0 relative" href={`${BASE_URL}/zip/${encodeURIComponent(slug)}`}>
          <ArrowDownTrayIcon className="w-10 h-10 mx-1" />
          <span className="absolute -bottom-1 right-0 text-[0.6rem] bg-indigo-600 rounded text-white font-bold uppercase px-1 shadow-sm shadow-indigo-600">zip</span>
        </a>
        <SortToggle />
        <ArrowPathIcon
          className="w-10 h-10 cursor-pointer"
          onClick={() => {
            void apolloClient.refetchQueries({
              include: ["Images"],
            });
          }}
        />
      </div>

      {slug && <Gallery sort={sort} tags={[slug]} />}
    </div>
  );
};

export default Tag;
