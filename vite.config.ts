import { resolve } from "path"
import { defineConfig } from "vite"

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/msal/index.ts"),
            name: "MSALGraphAPI",
            fileName: "msal-graphapi"
        },
        rollupOptions: {

        }
    }
})