import  esbuild from  "esbuild"
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
    external: [], // empty to ensure deps are bundled
});
