import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Skeleton from "@mui/material/Skeleton";
import React, { FunctionComponent, useMemo } from "react";

const ImageCardSkeleton: FunctionComponent = () => {
    const height = useMemo(() => 200 + Math.random() * 400, []);

    return <Card>
        <CardActionArea>
            <CardMedia>
                <Skeleton variant="rectangular" height={height} />
            </CardMedia>
        </CardActionArea>
        <CardContent>
            <Skeleton variant="rectangular" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={20} />
        </CardContent>
        <CardActions>
            <Skeleton variant="rectangular" height={30} width={70} />
            <Skeleton variant="rectangular" height={30} width={70} />
        </CardActions>
    </Card>;
};

export default ImageCardSkeleton;