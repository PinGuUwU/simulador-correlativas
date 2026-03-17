import { heroui } from "@heroui/react";

export default heroui({
    themes: {
        /* --- 1. MODO CLARO --- */
        light: {
            colors: {
                background: "#ffffff",
                foreground: "#000000",
                focus: "#006FEE",
                overlay: "#ffffff",
                default: {
                    /* Escala zinc: 400+ son oscuros para usarse como texto legible */
                    50: "#fafafa", 100: "#f4f4f5", 200: "#e4e4e7", 300: "#d4d4d8",
                    400: "#a1a1aa", 500: "#71717a", 600: "#52525b", 700: "#3f3f46",
                    800: "#27272a", 900: "#18181b",
                    foreground: "#000", DEFAULT: "#a1a1aa"
                },
                primary: {
                    50: "#dfedfd", 100: "#b3d4fa", 200: "#86bbf7", 300: "#59a1f4",
                    400: "#2d88f1", 500: "#006fee", 600: "#005cc4", 700: "#00489b",
                    800: "#003571", 900: "#002147",
                    foreground: "#fff", DEFAULT: "#006fee"
                },
                secondary: {
                    50: "#eee4f8", 100: "#d7bfef", 200: "#bf99e5", 300: "#a773db",
                    400: "#904ed2", 500: "#7828c8", 600: "#6321a5", 700: "#4e1a82",
                    800: "#39135f", 900: "#240c3c",
                    foreground: "#fff", DEFAULT: "#7828c8"
                },
                success: {
                    50: "#e2f8ec", 100: "#b9efd1", 200: "#91e5b5", 300: "#68dc9a",
                    400: "#40d27f", 500: "#17c964", 600: "#13a653", 700: "#0f8341",
                    800: "#0b5f30", 900: "#073c1e",
                    foreground: "#000", DEFAULT: "#17c964"
                },
                warning: {
                    50: "#fef4e4", 100: "#fce4bd", 200: "#fad497", 300: "#f9c571",
                    400: "#f7b54a", 500: "#f5a524", 600: "#ca881e", 700: "#9f6b17",
                    800: "#744e11", 900: "#4a320b",
                    foreground: "#000", DEFAULT: "#f5a524"
                },
                danger: {
                    50: "#fee1eb", 100: "#fbb8cf", 200: "#f98eb3", 300: "#f76598",
                    400: "#f53b7c", 500: "#f31260", 600: "#c80f4f", 700: "#9e0c3e",
                    800: "#73092e", 900: "#49051d",
                    foreground: "#000", DEFAULT: "#f31260"
                },
                content1: { DEFAULT: "#ffffff", foreground: "#000" },
                content2: { DEFAULT: "#f4f4f5", foreground: "#000" },
                content3: { DEFAULT: "#e4e4e7", foreground: "#000" },
                content4: { DEFAULT: "#d4d4d8", foreground: "#000" },
            }
        },

        /* --- 2. MODO OSCURO --- */
        dark: {
            colors: {
                background: "#000000",
                foreground: "#ffffff",
                focus: "#006FEE",
                overlay: "#000000",
                default: {
                    50: "#0d0d0e", 100: "#19191c", 200: "#26262a", 300: "#323238",
                    400: "#3f3f46", 500: "#65656b", 600: "#8c8c90", 700: "#b2b2b5",
                    800: "#d9d9da", 900: "#ffffff",
                    foreground: "#fff", DEFAULT: "#3f3f46"
                },
                primary: {
                    50: "#002147", 100: "#003571", 200: "#00489b", 300: "#005cc4",
                    400: "#006fee", 500: "#2d88f1", 600: "#59a1f4", 700: "#86bbf7",
                    800: "#b3d4fa", 900: "#dfedfd",
                    foreground: "#fff", DEFAULT: "#006fee"
                },
                secondary: {
                    50: "#240c3c", 100: "#39135f", 200: "#4e1a82", 300: "#6321a5",
                    400: "#7828c8", 500: "#904ed2", 600: "#a773db", 700: "#bf99e5",
                    800: "#d7bfef", 900: "#eee4f8",
                    foreground: "#fff", DEFAULT: "#7828c8"
                },
                success: {
                    50: "#073c1e", 100: "#0b5f30", 200: "#0f8341", 300: "#13a653",
                    400: "#17c964", 500: "#40d27f", 600: "#68dc9a", 700: "#91e5b5",
                    800: "#b9efd1", 900: "#e2f8ec",
                    foreground: "#000", DEFAULT: "#17c964"
                },
                warning: {
                    50: "#4a320b", 100: "#744e11", 200: "#9f6b17", 300: "#ca881e",
                    400: "#f5a524", 500: "#f7b54a", 600: "#f9c571", 700: "#fad497",
                    800: "#fce4bd", 900: "#fef4e4",
                    foreground: "#000", DEFAULT: "#f5a524"
                },
                danger: {
                    50: "#49051d", 100: "#73092e", 200: "#9e0c3e", 300: "#c80f4f",
                    400: "#f31260", 500: "#f53b7c", 600: "#f76598", 700: "#f98eb3",
                    800: "#fbb8cf", 900: "#fee1eb",
                    foreground: "#000", DEFAULT: "#f31260"
                },
                content1: { DEFAULT: "#18181b", foreground: "#fff" },
                content2: { DEFAULT: "#27272a", foreground: "#fff" },
                content3: { DEFAULT: "#3f3f46", foreground: "#fff" },
                content4: { DEFAULT: "#52525b", foreground: "#fff" },
            }
        },

        /* --- 3. MODO GIRLIE 🌸 --- */
        /* Paleta 100% rosa: desde el blanco rosado hasta el vino profundo */
        girlie: {
            extend: "light",
            colors: {
                background: "#fff0f6",   // Fondo rosa muy pálido (lavender blush)
                foreground: "#4a0028",   // Texto principal: vino oscuro
                focus: "#ec4899",
                overlay: "#fff0f6",

                /* Grises → grises rosados */
                default: {
                    /* Rosa-gris: 400+ oscuros para legibilidad en texto */
                    50: "#fdf5f9",   100: "#faeaf4",   200: "#f5d5ea",   300: "#efbfdf",
                    400: "#c47fa5",  500: "#a05e86",   600: "#7e4068",   700: "#5d264c",
                    800: "#3e1332",  900: "#21071b",
                    foreground: "#4a0028", DEFAULT: "#c47fa5"
                },

                /* Azules → Rosa fuerte / Hot pink (color de marca) */
                primary: {
                    50: "#fff0f6",   100: "#ffd6e8",   200: "#ffadd1",   300: "#ff85ba",
                    400: "#f85ca1",  500: "#ec4899",   600: "#d63384",   700: "#b91c6e",
                    800: "#9d1459",  900: "#831843",
                    foreground: "#ffffff", DEFAULT: "#ec4899"
                },

                /* Secundario → Fucsia / Magenta vibrante */
                secondary: {
                    50: "#fdf4ff",   100: "#fae8ff",   200: "#f3d0fe",   300: "#e9a8fd",
                    400: "#d973f8",  500: "#c026d3",   600: "#a21caf",   700: "#86198f",
                    800: "#701a75",  900: "#581c6d",
                    foreground: "#ffffff", DEFAULT: "#d946ef"
                },

                /* Verde → Verde menta femenino */
                success: {
                    50: "#f0fdf4",   100: "#dcfce7",   200: "#bbf7d0",   300: "#86efac",
                    400: "#4ade80",  500: "#22c55e",   600: "#16a34a",   700: "#15803d",
                    800: "#166534",  900: "#14532d",
                    foreground: "#fff", DEFAULT: "#22c55e"
                },

                /* Amarillo → Naranja melocotón cálido */
                warning: {
                    50: "#fff7ed",   100: "#ffedd5",   200: "#fed7aa",   300: "#fdba74",
                    400: "#fb923c",  500: "#f97316",   600: "#ea580c",   700: "#c2410c",
                    800: "#9a3412",  900: "#7c2d12",
                    foreground: "#fff", DEFAULT: "#fb923c"
                },

                /* Rojo → Rojo cereza / Carmine */
                danger: {
                    50: "#fff1f2",   100: "#ffe4e8",   200: "#fecdd3",   300: "#fda4af",
                    400: "#fb7185",  500: "#f43f5e",   600: "#e11d48",   700: "#be123c",
                    800: "#9f1239",  900: "#881337",
                    foreground: "#fff", DEFAULT: "#f43f5e"
                },

                /* Tarjetas y superficies en la gamma rosa */
                content1: { DEFAULT: "#fce7f3", foreground: "#4a0028" },
                content2: { DEFAULT: "#fbcfe8", foreground: "#4a0028" },
                content3: { DEFAULT: "#f9a8d4", foreground: "#4a0028" },
                content4: { DEFAULT: "#f472b6", foreground: "#ffffff" },
                divider: "#fbcfe8",
            }
        },

        /* --- 4. MODO PASTEL 🎨 --- */
        /* Todos los colores en tonalidades suaves y desaturadas */
        pastel: {
            extend: "light",
            colors: {
                background: "#fdfbf7",   // Fondo crema muy suave
                foreground: "#2d2d2d",   // Texto oscuro — alto contraste sobre crema
                focus: "#c4b5fd",
                overlay: "#fdfbf7",

                /* Grises → Grises lavanda cálidos */
                default: {
                    /* Lavanda-gris: 400+ oscuros para legibilidad en texto */
                    50: "#f9f8fb",   100: "#f2f0f8",   200: "#e8e4f3",   300: "#dad4ec",
                    400: "#9e97c9",  500: "#7a73a8",   600: "#5c5687",   700: "#45406a",
                    800: "#30294d",  900: "#1c1733",
                    foreground: "#2d2d2d", DEFAULT: "#9e97c9"
                },

                /* Azules → Lavanda / Lila pastel */
                primary: {
                    50: "#f5f3ff",   100: "#ede9fe",   200: "#ddd6fe",   300: "#c4b5fd",
                    400: "#a78bfa",  500: "#8b5cf6",   600: "#7c3aed",   700: "#6d28d9",
                    800: "#5b21b6",  900: "#4c1d95",
                    foreground: "#ffffff", DEFAULT: "#c4b5fd"
                },

                /* Secundario → Azul cielo pastel / Periwinkle */
                secondary: {
                    50: "#eff6ff",   100: "#dbeafe",   200: "#bfdbfe",   300: "#93c5fd",
                    400: "#60a5fa",  500: "#3b82f6",   600: "#2563eb",   700: "#1d4ed8",
                    800: "#1e40af",  900: "#1e3a8a",
                    foreground: "#ffffff", DEFAULT: "#93c5fd"
                },

                /* Verde → Menta pastel */
                success: {
                    50: "#f0fdf4",   100: "#dcfce7",   200: "#bbf7d0",   300: "#86efac",
                    400: "#4ade80",  500: "#22c55e",   600: "#16a34a",   700: "#15803d",
                    800: "#166534",  900: "#14532d",
                    foreground: "#064e3b", DEFAULT: "#86efac"
                },

                /* Amarillo → Amarillo patito pastel */
                warning: {
                    50: "#fffbeb",   100: "#fef3c7",   200: "#fde68a",   300: "#fcd34d",
                    400: "#fbbf24",  500: "#f59e0b",   600: "#d97706",   700: "#b45309",
                    800: "#92400e",  900: "#78350f",
                    foreground: "#713f12", DEFAULT: "#fde68a"
                },

                /* Rojo → Coral / Durazno pastel */
                danger: {
                    50: "#fff1f2",   100: "#ffe4e6",   200: "#fecdd3",   300: "#fca5a5",
                    400: "#f87171",  500: "#ef4444",   600: "#dc2626",   700: "#b91c1c",
                    800: "#991b1b",  900: "#7f1d1d",
                    foreground: "#7f1d1d", DEFAULT: "#fca5a5"
                },

                /* Tarjetas y superficies con toque lavanda */
                content1: { DEFAULT: "#ffffff",  foreground: "#2d2d2d" },
                content2: { DEFAULT: "#f5f3ff",  foreground: "#2d2d2d" },
                content3: { DEFAULT: "#ede9fe",  foreground: "#2d2d2d" },
                content4: { DEFAULT: "#ddd6fe",  foreground: "#2d2d2d" },
                divider: "#e5e7eb",
            }
        }
    }
});