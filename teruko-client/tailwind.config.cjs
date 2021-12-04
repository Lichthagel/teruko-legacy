module.exports = {
    mode: "jit",
    purge: ["./src/**/*.{html,js,jsx,ts,tsx}"],
    darkMode: "media", // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                darkpurple: "#151419"
            },
            spacing: {
                "90vh": "90vh"
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
