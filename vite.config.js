import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  server: { https: true, host: "0.0.0.0" },
  plugins: [mkcert()],
  base: "https://svandenhout.github.io/webxr",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "depth-estimation": resolve(__dirname, "./depth-estimation.html"),
        "environment-collision": resolve(
          __dirname,
          "./environment-collision.html"
        ),
        "hit-test": resolve(__dirname, "hit-test.html"),
        "light-estimation": resolve(__dirname, "light-estimation.html"),
        oclusion: resolve(__dirname, "oclusion.html"),
      },
    },
  },
});
