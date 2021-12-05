import { createTheme, ThemeOptions } from "@mui/material/styles";

export const themeConfig: ThemeOptions = {
    palette: {
        mode: "dark"
        /* primary: {
            main: "#9c27b0"
        },
        secondary: {
            main: "#e64a19"
        }*/
    }
};

export default createTheme(themeConfig);