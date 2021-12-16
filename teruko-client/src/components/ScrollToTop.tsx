import { FunctionComponent } from "preact";
import { useLayoutEffect } from "preact/hooks";
import { useLocation } from "react-router-dom";

const ScrollToTop: FunctionComponent = () => {
    const location = useLocation();

    useLayoutEffect(() => {
        window.scroll({ top: 0 });
    }, [location.pathname]);

    return null;
};

export default ScrollToTop;