import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import React, { FunctionComponent, useState } from "react";

const LoaderImage: FunctionComponent<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = (props) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <Box position="relative">
            <Skeleton
                variant="rectangular"
                sx={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: loaded ? "none" : undefined }}
                width="100%"
                height="100%" />
            <img {...props}
                style={{
                    // eslint-disable-next-line react/prop-types,react/destructuring-assignment
                    ...props.style,
                    position: "relative",
                    transition: "opacity 1s",
                    zIndex: 10,
                    opacity: !loaded ? 0 : undefined
                }}
                onLoad={() => setLoaded(true)} />
        </Box>);
};

export default LoaderImage;