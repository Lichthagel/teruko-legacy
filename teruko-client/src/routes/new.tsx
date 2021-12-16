import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { NEW_IMAGE, NEW_IMAGE_FROM_PIXIV } from "../queries/image";
import clsx from "clsx";
import { useCallback, useState } from "preact/hooks";
import { JSX } from "preact";

const New = () => {
    const navigate = useNavigate();

    const [pixivUrl, setPixivUrl] = useState("");

    const [newImage, { loading, error }] = useMutation(NEW_IMAGE, {
        refetchQueries: ["Images", "GetNext"],
        update(cache) {
            cache.modify({
                fields: {
                    imageCount(prev = 0) {
                        return prev + 1;
                    }
                }
            });
        },
        onError(error) {
            alert(`Error: ${error.message}`);
        }
    });

    const [newImageFromPixiv, { loading: loadingPixiv, error: errorPixiv }] = useMutation(NEW_IMAGE_FROM_PIXIV, {
        variables: {
            url: pixivUrl
        },
        refetchQueries: ["Images", "GetNext"],
        update(cache) {
            cache.modify({
                fields: {
                    imageCount(prev = 0) {
                        return prev + 1;
                    }
                }
            });
        },
        onError(error) {
            alert(`Error: ${error.message}`);
        }
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

        if (!loading && !error && event.dataTransfer) {
            newImage({
                variables: {
                    files: event.dataTransfer.files
                }
            })
                .then(() => {
                    navigate("/");
                });
        }


    }, [error, loading, navigate, newImage]);

    const handlePixiv = useCallback((event: JSX.TargetedEvent<HTMLFormElement>) => {
        event.stopPropagation();
        event.preventDefault();

        if (pixivUrl !== "" && !loadingPixiv && !errorPixiv) {
            newImageFromPixiv().then(() => navigate("/"));
        }
    }, [
        errorPixiv,
        loadingPixiv,
        navigate,
        newImageFromPixiv,
        pixivUrl
    ]);

    return (
        <div className="flex flex-col items-center mt-20">
            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={clsx(
                    "w-96 text-center border-4 border-dashed border-indigo-800 dark:border-indigo-400 py-12 text-3xl md:text-4xl",
                    {
                        "border-indigo-800 dark:border-indigo-400": !error,
                        "border-red-800 dark:border-red-400": error
                    }
                )}>
                {!loading ? "drop image here" : "..."}
            </div>

            <form onSubmit={handlePixiv} className="my-3">
                <input
                    type="text"
                    className={clsx("w-96 max-w-full", { "animate-pulse": loadingPixiv })}
                    value={pixivUrl}
                    placeholder="or enter a pixiv URL"
                    disabled={loadingPixiv}
                    onInput={(event: JSX.TargetedEvent<HTMLInputElement>) => setPixivUrl((event.target as HTMLInputElement).value)} />
            </form>
        </div>
    );
};

export default New;
