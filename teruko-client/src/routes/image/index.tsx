import { useQuery } from "@apollo/client";
import {
  ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardDocumentIcon, PencilIcon,
} from "@heroicons/react/24/outline";
import { Fragment } from "preact";
import { useCallback, useEffect, useMemo } from "preact/hooks";
import {
  Link, useNavigate, useParams, useSearchParams,
} from "react-router-dom";

import LoaderImage from "../../components/LoaderImage";
import Tag from "../../components/Tag";
import { Image as ImageModel } from "../../models";
import { GET_IMAGE, GET_IMAGES } from "../../queries/image";

const Image = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const id = params.id;
  const tags = searchParams.getAll("tag");
  const sort = searchParams.get("sort") || "random";

  const { loading, data } = useQuery<{ image?: ImageModel }>(GET_IMAGE, {
    variables: {
      id,
    },
    skip: !id,
  });

  const { data: dataImages, fetchMore } = useQuery<{ images: ImageModel[] }>(GET_IMAGES, {
    variables: {
      skip: 0,
      take: 1,
      sort,
      tags,
    },
  });

  const previous: ImageModel | null = useMemo(() => {
    if (data && data.image && dataImages) {
      const images: ImageModel[] = dataImages.images;
      if (images.length > 0) {
        const index = images.findIndex((el) => el.id === data.image.id);
        if (index === -1) {
          return null;
        } else {
          return index > 0 ? images[index - 1] : null;
        }
      } else { return null; }
    } else { return null; }
  }, [data, dataImages]);

  const next: ImageModel | null = useMemo(() => {
    if (data && data.image && dataImages) {
      const images: ImageModel[] = dataImages.images;
      if (images.length > 0) {
        const index = images.findIndex((el) => el.id === data.image.id);
        if (index === -1) {
          return images[0];
        } else {
          if (index + 1 >= images.length) {
            void fetchMore({
              variables: {
                skip: images.length,
                take: sort === "random" ? 3 : 1, // take 3 since although unlike one image might be one which was already fetched
                sort,
                tags,
              },
            });
            return null;
          } else {
            return images[index + 1];
          }
        }
      } else { return null; }
    } else { return null; }
  }, [
    data,
    dataImages,
    fetchMore,
    sort,
    tags,
  ]);

  const goPrevious = useCallback(() => {
    if (previous) {
      navigate({
        pathname: `/${previous.id}`,
        search: `?sort=${sort}${tags.map((tag) => `&tag=${tag}`).join("")}`,
      }, { replace: true });
    }
  }, [
    navigate,
    previous,
    sort,
    tags,
  ]);

  const goNext = useCallback(() => {
    if (next) {
      navigate({
        pathname: `/${next.id}`,
        search: `?sort=${sort}${tags.map((tag) => `&tag=${tag}`).join("")}`,
      }, { replace: true });
    }
  }, [
    navigate,
    next,
    sort,
    tags,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement && document.activeElement.tagName.toUpperCase() === "INPUT") {
        return;
      }

      switch (event.code) {
        case "ArrowRight": {
          event.preventDefault();
          void goNext();

          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          void goPrevious();

          break;
        }
        case "Escape": {
          event.preventDefault();
          navigate({
            pathname: "/",
            search: searchParams.toString(),
          });

          break;
        }
        default: { if (event.ctrlKey && event.code === "KeyE") {
          event.preventDefault();
          if (id) {
            navigate({
              pathname: `/${id}/edit`,
              search: `${searchParams.toString()}${next ? `&next=${next.id}` : ""}`,
            });
          }
        }
        }
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
    searchParams,
  ]);

  const image: ImageModel | undefined = (data && data.image) || undefined;

  const fileExt = image?.filename.slice(image.filename.lastIndexOf(".") + 1);

  return (
    <div className="flex flex-col items-center">
      {!loading && image && id && (
        <Fragment>
          <div className="w-full relative">
            <LoaderImage
              alt={image.title || image.id.toString()}
              className="max-w-full h-auto max-h-[100vh] mx-auto cursor-pointer shadow-xl shadow-indigo-400 dark:shadow-indigo-800"
              onClick={goNext}
              src={`/img/${image.filename}`}
            />

            <ChevronLeftIcon
              className="absolute w-20 h-20 z-20 left-0 bottom-[50%] transition hover:text-indigo-800 cursor-pointer"
              onClick={goPrevious}
            />

            <ChevronRightIcon
              className="absolute w-20 h-20 z-20 right-0 bottom-[50%] transition hover:text-indigo-800 cursor-pointer"
              onClick={goNext}
            />
          </div>

          <div className="container mx-auto">
            <div className="w-full my-4 p-1">
              <div className="flex items-center">
                {image.title ? <h1 className="text-3xl flex-grow overflow-hidden">{image.title}</h1> : <h1 className="text-3xl flex-grow text-gray-500 dark:text-gray-400 overflow-hidden">No title</h1>}
                <div className="mx-2 text-indigo-500/80 dark:text-gray-400 text-sm text-right flex-shrink-0">
                  <div>
                    <span className="font-light">Created At: </span>
                    {new Date(image.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-light">Updated At: </span>
                    {new Date(image.updatedAt).toLocaleString()}
                  </div>
                </div>
                <a className="flex-shrink-0 relative" href={`http://${window.location.hostname}:3030/original/${image.id}`}>
                  <ArrowDownTrayIcon className="w-10 h-10 mx-1" />
                  <span className="absolute -bottom-1 right-0 text-[0.6rem] bg-indigo-600 rounded text-white font-bold uppercase px-1 shadow-sm shadow-indigo-600">{fileExt}</span>
                </a>
                {fileExt && fileExt !== "avif" && (
                  <a className="flex-shrink-0 relative" href={`http://${window.location.hostname}:3030/avif/${image.id}`}>
                    <ArrowDownTrayIcon className="w-10 h-10 mx-1" />
                    <span className="absolute -bottom-1 right-0 text-[0.6rem] bg-indigo-600 rounded text-white font-bold uppercase px-1 shadow-sm shadow-indigo-600">avif</span>
                  </a>
                )}
                <a className="flex-shrink-0 relative" href={`http://${window.location.hostname}:3030/webp/${image.id}`}>
                  <ArrowDownTrayIcon className="w-10 h-10 mx-1" />
                  <span className="absolute -bottom-1 right-0 text-[0.6rem] bg-indigo-600 rounded text-white font-bold uppercase px-1 shadow-sm shadow-indigo-600">webp</span>
                </a>
                <Link className="flex-shrink-0" replace to={{ pathname: `/${id}/edit`, search: `?${searchParams.toString()}${next ? `&next=${next.id}` : ""}` }}>
                  <PencilIcon className="w-8 h-8 mx-1" />
                </Link>
              </div>

              {image.source ?
                  (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Source: </span>
                      <a
                        className="text-blue-800 dark:text-blue-300 mb-3"
                        href={image.source}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {image.source}
                      </a>
                      <ClipboardDocumentIcon
                        className="h-6 inline-block relative bottom-1 cursor-pointer transition-colors"
                        onClick={async (event: MouseEvent) => {
                          if (window.navigator.clipboard) {
                            try {
                              await window.navigator.clipboard.writeText(image.source ?? "");
                              (event.target as SVGElement).classList.add("text-emerald-600");

                              setTimeout(() => {
                                (event.target as SVGElement).classList.remove("text-emerald-600");
                              }, 1000);
                            } catch (error: unknown) {
                              alert(`could not copy: ${error as string}`);
                            }
                          } else {
                            alert(`insecure context - ${image.source || "no source"}`);
                          }
                        }}
                      />
                    </div>
                  ) :
                  <p className="dark:text-gray-400 mb-3">No source</p>}

            </div>

            <div className="w-full">
              {image.tags.map((tag: { slug: string }) => (
                <Link key={tag.slug} to={{ pathname: `/tag/${encodeURIComponent(tag.slug)}` }}>
                  <Tag tag={tag} />
                </Link>
              ))}
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default Image;
