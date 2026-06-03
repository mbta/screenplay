import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import { exit } from "node:process";

const [cmd] = process.argv.slice(2);

/**
 * Sass plugin options used to suppress `@import` related warnings when
 * building the project. These options have been added until Bootstrap migrates
 * to more modern `@use` syntax. Once the migration is complete and Bootstrap
 * has been migrated, these options should be removed.
 *
 * @type {Partial<import("esbuild-sass-plugin").SassPluginOptions>}
 */
const useKeywordAdoptionOpts = {
  // Suppress warnings from Bootstrap (and other third party dependencies)
  quietDeps: true,
  // We still need to use `@import` on Bootstrap, and `quietDeps` does not
  // suppress those import statements.
  silenceDeprecations: ["import"],
};

/**
 * @type {Partial<import("esbuild").BuildOptions>}
 */
const opts = {
  entryPoints: ["js/app.tsx"],
  bundle: true,
  outdir: "../priv/static/assets",
  plugins: [
    sassPlugin({
      filter: /\.module\.scss$/,
      type: "local-css",
      ...useKeywordAdoptionOpts,
    }),
    sassPlugin({
      filter: /\.scss$/,
      type: "css",
      ...useKeywordAdoptionOpts,
    }),
  ],
  loader: { ".svg": "file" },
  publicPath: "/assets/",
};

if (cmd === "deploy") {
  const result = await esbuild.build({ ...opts, minify: true });
  if (result.warnings.length > 0) {
    console.error(
      `The build exited with one or more warnings, which are treated as warnings for the '${cmd}' command.`,
    );
    console.error("Exiting.");
    exit(1);
  }
} else if (cmd === "watch") {
  const ctx = await esbuild.context({ ...opts, sourcemap: "inline" });
  await ctx.watch();
} else {
  console.error("missing command");
}
