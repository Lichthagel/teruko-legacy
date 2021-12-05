import { Route, Routes, Link } from "react-router-dom";
import Home from "./routes/index";
import React, { Fragment } from "react";
import Image from "./routes/image";
import Tag from "./routes/tag";
import New from "./routes/new";
import { GET_IMAGE_COUNT } from "./queries/image";
import { default as ArrowUpwardIcon } from "@mui/icons-material/ArrowUpward";
import { default as UploadIcon } from "@mui/icons-material/Upload";
import ScrollToTop from "./components/ScrollToTop";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import { useQuery } from "@apollo/client/react/hooks/useQuery";

const App = () => {
    const { data: imageCountData } = useQuery(GET_IMAGE_COUNT, { pollInterval: 60000 });

    return <Fragment>
        <CssBaseline />
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar>
                    <Link to="/">
                        <Button
                            sx={{ mr: 2 }}>
                            <Typography
                                variant="h6"
                                noWrap
                                component="div" >
                            TERUKO
                            </Typography>
                        </Button>
                    </Link>
                    <Box sx={{ flexGrow: 1 }}></Box>
                    {imageCountData && <Box sx={{ mr: 2 }}>{imageCountData.imageCount} images</Box>}
                    <Link to="/new">
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="new"
                            sx={{}}>
                            <UploadIcon />
                        </IconButton>
                    </Link>
                </Toolbar>
            </Container>
        </AppBar>
        <Container maxWidth="xl">
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path=":id" element={<Image />} />
                <Route path="tag/:slug" element={<Tag />} />
                <Route path="new" element={<New />} />
            </Routes>
        </Container>
        <Fab
            color="primary"
            aria-label="scrollToTop"
            sx={{ position: "fixed", bottom: 10, right: 10 }}
            onClick={() => {
                window.scrollTo({ behavior: "smooth", top: 0 });
            }}>
            <ArrowUpwardIcon />
        </Fab>
    </Fragment>;
};

export default App;