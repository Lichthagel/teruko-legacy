import React, { FunctionComponent, useState } from "react";
import LoaderImage from "./LoaderImage";
import { default as OpenInNewIcon } from "@mui/icons-material/OpenInNew";
import { default as ExpandMoreIcon } from "@mui/icons-material/ExpandMore";
import { Link } from "react-router-dom";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Fade from "@mui/material/Fade";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? "rotate(180deg)" : "rotate(0deg)",
    transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest
    })
}));

const ImageCard: FunctionComponent<{ image: { id:number; filename: string; title?: string; source?: string; tags: { slug: string; category?: { color?: string } }[] }; onClick: () => void }> = ({ image, onClick }) => {

    const [expanded, setExpanded] = useState(false);

    return <Card sx={{ position: "relative" }}>
        <CardActionArea onClick={() => onClick()}>
            <CardMedia>
                <LoaderImage src={`http://${window.location.hostname}:3030/img/${image.filename}`} alt={image.title || image.id.toString()} style={{ width: "100%", display: "block" }} />
            </CardMedia>
        </CardActionArea>
        <Fade in={expanded}>
            <Box
                position="absolute"
                left={0}
                right={0}
                bottom={0}
                zIndex={10} >
                <Card>
                    <CardContent>
                        {image.title &&
                <Typography gutterBottom variant="h6" component="div">
                    {image.title}
                </Typography>}
                        {image.tags.filter(tag => !tag.slug.startsWith("artist_")).map(tag =>
                            <Link key={image.id + tag.slug} to={`/tag/${tag.slug}`}>
                                <Chip
                                    label={tag.slug}
                                    sx={{ m: 0.2, bgcolor: tag.category && tag.category.color }}
                                    size="small"
                                    clickable />
                            </Link>)}
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={() => onClick()}>Open</Button>
                        {image.source && <a target="_blank" href={image.source} rel="noreferrer"><Button size="small" endIcon={<OpenInNewIcon />}>Source</Button></a>}
                    </CardActions>
                </Card>
            </Box>
        </Fade>
        <ExpandMore
            expand={expanded}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                setExpanded(!expanded);
            }}
            size="small"
            sx={{ position: "absolute", bottom: 2, right: 2, zIndex: 10, bgcolor: !expanded ? "rgba(0,0,0,0.1)" : undefined }}>
            <ExpandMoreIcon />
        </ExpandMore>
    </Card>;
};

export default ImageCard;