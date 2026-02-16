import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },
                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },
                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },
                // Agro Premium Specific Palette (Moss Restored)
                agri: {
                    green: {
                        50: "#f4f7f4",
                        100: "#e3e9e3",
                        500: "#4d7c0f", // Primary Moss (Brand)
                        600: "#3f6212", // Deep Olive (Hover)
                        700: "#365314", // Dark Organic
                        800: "#1a2e05", // Deep Forest
                        900: "#14532d", // Legacy Dark
                        950: "#0f1a05", // Darkest Moss
                    },
                    gold: {
                        500: "#ca8a04", // Darker Gold (More serious)
                        600: "#a16207", // Bronze/Brown tone
                    },
                    slate: {
                        800: "#1e293b", // Panel Background
                        900: "#0f172a", // App Background
                        950: "#020617", // Darkest
                    }
                }
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'hard-shell': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
};
export default config;
