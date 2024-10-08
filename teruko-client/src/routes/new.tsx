import { useMutation } from "@apollo/client";
import clsx from "clsx";
import { JSX } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";

import { NEW_IMAGE, NEW_IMAGE_FROM_URL } from "../queries/image";

const New = () => {
  const navigate = useNavigate();

  const [sourceUrl, setSourceUrl] = useState("");

  const [newImage, { loading, error }] = useMutation(NEW_IMAGE, {
    refetchQueries: ["Images", "GetNext"],
    update(cache) {
      cache.modify({
        fields: {
          imageCount(prev?: number) {
            return (prev || 0) + 1;
          },
        },
      });
    },
    onError(error) {
      alert(`Error: ${error.message}`);
    },
  });

  const [newImageFromUrl, { loading: loadingUrl, error: errorUrl }] = useMutation(NEW_IMAGE_FROM_URL, {
    variables: {
      url: sourceUrl,
    },
    refetchQueries: ["Images", "GetNext"],
    update(cache) {
      cache.modify({
        fields: {
          imageCount(prev?: number) {
            return (prev || 0) + 1;
          },
        },
      });
    },
    onError(error) {
      alert(`Error: ${error.message}`);
    },
  });

  const handleDragOver = useCallback((event: DragEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (!loading && !error && event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  }, [error, loading]);

  const handleDrop = useCallback((event: DragEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (!loading && !error && !!event.dataTransfer) {
      void (async () => {
        if (!event.dataTransfer) {
          return;
        }

        await newImage({
          variables: {
            files: event.dataTransfer.files,
          },
        });

        navigate("/");
      })();
    }
  }, [
    error,
    loading,
    navigate,
    newImage,
  ]);

  const handleUrl = useCallback((event: JSX.TargetedEvent<HTMLFormElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (sourceUrl !== "" && !loadingUrl && !errorUrl) {
      void (async () => {
        await newImageFromUrl();
        navigate("/");
      })();
    }
  }, [
    errorUrl,
    loadingUrl,
    navigate,
    newImageFromUrl,
    sourceUrl,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement && document.activeElement.tagName.toUpperCase() === "INPUT") {
        return;
      }

      if (event.code === "Escape") {
        event.preventDefault();
        navigate({
          pathname: "/",
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center mt-20 container mx-auto">
      <div
        className={clsx(
          "w-96 text-center border-4 border-dashed border-indigo-800 dark:border-indigo-400 py-12 text-3xl md:text-4xl",
          {
            "border-indigo-800 dark:border-indigo-400": !error,
            "border-red-800 dark:border-red-400": error,
          },
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {loading ? "..." : "drop image here"}
      </div>

      <form className="my-3" onSubmit={handleUrl}>
        <input
          className={clsx("w-96 max-w-full", { "animate-pulse": loadingUrl })}
          disabled={loadingUrl}
          onInput={(event: JSX.TargetedEvent<HTMLInputElement>) => setSourceUrl((event.target as HTMLInputElement).value)}
          placeholder="or enter a pixiv URL"
          type="text"
          value={sourceUrl}
        />
      </form>
    </div>
  );
};

export default New;
