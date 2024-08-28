import { useMutation, useQuery } from "@apollo/client";
import { ArrowDownTrayIcon, ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { JSX } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import {
  Link, createSearchParams, useNavigate, useParams, useSearchParams,
} from "react-router-dom";

import type { Image } from "../../models";

import IconButton from "../../components/IconButton";
import LoadingIconButton from "../../components/LoadingIconButton";
import Tag from "../../components/Tag";
import TagInput from "../../components/TagInput";
import {
  DELETE_IMAGE, GET_IMAGE, UPDATE_IMAGE, UPDATE_IMAGE_PIXIV,
} from "../../queries/image";
import { ADD_TAG, REMOVE_TAG } from "../../queries/tag";

const EditImage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const id = params.id;

  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");

  const { loading, data } = useQuery<{ image?: Image }>(GET_IMAGE, {
    variables: {
      id,
    },
    skip: !id,
    nextFetchPolicy: "cache-only",
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
    },
  });

  const [deleteImage, { loading: deleteLoading }] = useMutation<{ deleteImage: { id: string } }>(DELETE_IMAGE, {
    variables: {
      id,
    },
    refetchQueries: ["ImageCount"],
    update(cache, result) {
      if (!result.data) {
        return;
      }

      cache.modify({
        id: cache.identify(result.data.deleteImage),
        fields(fieldValue, details) {
          return details.DELETE;
        },
      });
    },
  });

  const [addTag] = useMutation(ADD_TAG, {
    refetchQueries: ["TagSuggestions"],
    update(cache, _, context) {
      if (!context.variables) {
        return;
      }
      cache.modify({
        id: cache.identify({
          __typename: "Tag",
          slug: context.variables.tag as string,
        }),
        fields: {
          count: (fieldValue, details) => details.INVALIDATE,
        },
      });
    },
  });

  const [removeTag] = useMutation(REMOVE_TAG, {
    update(cache, _, context) {
      if (!context.variables) {
        return;
      }
      cache.modify({
        id: cache.identify({
          __typename: "Tag",
          slug: context.variables.tag as string,
        }),
        fields(fieldValue, details) {
          return details.INVALIDATE;
        },
      });
    },
  });

  const handleSubmit = useCallback((event: JSX.TargetedEvent<HTMLFormElement>) => {
    event.preventDefault();
    void updateImage({
      variables: {
        id,
        title: title === "" ? undefined : title,
        source: source === "" ? undefined : source,
      },
    });
  }, [
    id,
    source,
    title,
    updateImage,
  ]);

  const handleDelete = useCallback(() => {
    if (confirm("Delete?")) {
      void (async () => {
        await deleteImage();

        const next = searchParams.get("next");

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("next");

        navigate({
          pathname: next ? `/${next}` : "/",
          search: `?${newSearchParams.toString()}`,
        }, {
          replace: true,
        });
      })();
    }
  }, [deleteImage, navigate, searchParams]);

  const handleUpdatePixiv = useCallback(() => {
    void updateImagePixiv({
      variables: {
        id,
      },
    });
  }, [id, updateImagePixiv]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement && document.activeElement.tagName.toUpperCase() === "INPUT") {
        return;
      }

      if (event.code === "Escape") {
        event.preventDefault();
        if (id) {
          navigate({
            pathname: `/${id}`,
            search: searchParams.toString(),
          });
        }
      } else if (event.ctrlKey && event.code === "KeyD") {
        event.preventDefault();
        void handleDelete();
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
    searchParams,
  ]);

  return (
    <div className="max-w-2xl mx-auto rounded-md bg-neutral-200 dark:bg-neutral-800 p-2 mt-20 shadow-md dark:shadow-indigo-800">
      <div className="flex flex-row items-center">
        <Link replace to={{ pathname: `/${id || ""}`, search: createSearchParams({ sort: searchParams.getAll("sort"), tag: searchParams.getAll("tag") }).toString() }}>
          <IconButton>
            <ArrowLeftIcon />
          </IconButton>
        </Link>
        <div className="flex-grow" />
        <LoadingIconButton
          loading={loadingFetchPixiv}
          onClick={handleUpdatePixiv}
        >
          <ArrowDownTrayIcon />
        </LoadingIconButton>
        <LoadingIconButton
          loading={deleteLoading}
          onClick={handleDelete}
        >
          <TrashIcon />
        </LoadingIconButton>
      </div>

      {!loading && data && (
        <div>
          <form className="mx-auto my-3 flex flex-col w-max" onSubmit={handleSubmit}>
            <div>
              <h3>Title</h3>
              <input
                className="w-96 outline-none"
                onInput={(event: JSX.TargetedEvent<HTMLInputElement>) => setTitle((event.target as HTMLInputElement).value)}
                type="text"
                value={title}
              />
            </div>
            <div>
              <h3>Source</h3>
              <input
                className="w-96 outline-none"
                onInput={(event: JSX.TargetedEvent<HTMLInputElement>) => setSource((event.target as HTMLInputElement).value)}
                type="text"
                value={source}
              />
            </div>
            <button className="my-5" type="submit">{updateLoading ? "..." : (updateError ? "error" : "update")}</button>
          </form>
          <div className="flex-grow">
            <h1>Tags</h1>
            <div>
              {data && data.image && data.image.tags && data.image.tags.map((tag: { slug: string }) => (
                <Tag
                  key={tag.slug}
                  onClick={
                    () => {
                      void removeTag({
                        variables: {
                          imageId: id,
                          tag: tag.slug,
                        },
                      });
                    }
                  }
                  tag={tag}
                />
              ))}
              <TagInput handleSubmit={(slug) => {
                void addTag({
                  variables: {
                    imageId: id,
                    tag: slug,
                  },
                });
              }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditImage;
