import  esbuild from  "esbuild";
import { minifyHTMLLiterals } from 'minify-html-literals';
import { readFile } from 'node:fs/promises';

//import info from "./package.json" assert { type: "json" };
//const externals = Object.keys(info.peerDependencies);

esbuild.build({
    entryNames: "[dir]/[name]",
    bundle: true,
    minify: true,
    splitting: true,
    format: "esm",
    entryPoints: [
        "./src/lit-line.ts",
    ],
    outdir: "cdn",
    plugins: [minifyHTMLLiteralsPlugin()],
    external: [], // empty to ensure deps are bundled
});

/*
 * From the awesome bennypowers/lit-css
 */
export function minifyHTMLLiteralsPlugin(options) {
  const { filter = /\.[jt]s$/, ...minifyOptions } = options ?? {};
  return {
    name: 'minifyHTMLLiterals',
    setup(build) {
      const cache = new Map();

      build.onLoad({ filter }, async ({ path }) => {
        const loader = path.match(/c?tsx?$/) ? 'ts' : 'js';
        const input = await readFile(path, 'utf8');
        const cached = cache.get(path);
        if (cached?.source === input)
          return cached.output;
        else {
          const result = minifyHTMLLiterals(input, minifyOptions) ?? undefined;
          const contents = result && `${result.code}\n//# sourceMappingURL=${result.map?.toUrl()}`;
          const output = result && { contents, loader };
          cache.set(path, { input, output });
          return output;
        }
      });
    },
  };
}