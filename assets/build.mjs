import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

const [cmd] = process.argv.slice(2);

const opts = {
  entryPoints: ["js/app.tsx"],
  bundle: true,
  outdir: "../priv/static/assets",
  plugins: [
    sassPlugin({
      filter: /\.module\.scss$/,
      type: "local-css",
    }),
    sassPlugin({
      filter: /\.scss$/,
      type: "css",
    }),
  ],
  publicPath: "assets/",
};

if (cmd === "deploy") {
  await esbuild.build({ ...opts, minify: true });
} else if (cmd === "watch") {
  const ctx = await esbuild.context({ ...opts, sourcemap: "inline" });
  await ctx.watch();
} else {
  console.error("missing command");
}
