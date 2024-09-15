import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment } from "preact";
import { lazy, Suspense } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { Route, Routes, useMatch } from "react-router-dom";

import IconButton from "./components/IconButton";
import Nav from "./components/Nav";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./routes/index";

const Image = lazy(() => import("./routes/image"));
const EditImage = lazy(() => import("./routes/image/edit"));
const Tag = lazy(() => import("./routes/tag"));
const New = lazy(() => import("./routes/new"));

const App = () => {
  const isImageView = useMatch(":id");

  const [showToTop, setShowToTop] = useState(false);
  const [showToBottom, setShowToBottom] = useState(true);

  useEffect(() => {
    const scrollListener = () => {
      const pos = window.scrollY;
      if (pos > 50) {
        setShowToTop(true);
      } else {
        setShowToTop(false);
      }

      if (pos + window.innerHeight < document.body.scrollHeight - 50) {
        setShowToBottom(true);
      } else {
        setShowToBottom(false);
      }
    };

    window.addEventListener("scroll", scrollListener);

    return () => {
      window.removeEventListener("scroll", scrollListener);
    };
  }, []);

  return (
    <Fragment>
      <Nav />
      <ScrollToTop />
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Suspense fallback="..."><Image /></Suspense>} path=":id" />
        <Route element={<Suspense fallback="..."><EditImage /></Suspense>} path=":id/edit" />
        <Route element={<Suspense fallback="..."><Tag /></Suspense>} path="tag/:slug" />
        <Route element={<Suspense fallback="..."><New /></Suspense>} path="new" />
      </Routes>
      <div className="fixed bottom-3 right-0 left-0 z-10 pointer-events-none">
        <div className="container mx-auto px-3">
          <div className={clsx("pointer-events-auto flex flex-row ml-auto mr-0 w-min bg-neutral-100 shadow-lg dark:bg-zinc-800 rounded-xl p-1 transition hover:opacity-100", { "opacity-20": isImageView })}>
            <IconButton
              hidden={!showToTop}
              onClick={() => {
                window.scrollTo({ behavior: "smooth", top: 0 });
              }}
            >
              <ChevronUpIcon className="w-10 h-10" />
            </IconButton>
            <IconButton
              hidden={!showToBottom}
              onClick={() => {
                window.scrollTo({ behavior: "smooth", top: window.document.body.scrollHeight });
              }}
            >
              <ChevronDownIcon className="w-10 h-10" />
            </IconButton>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default App;
