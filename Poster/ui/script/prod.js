let fs = require("fs-extra");
let esbuild = require("esbuild");
let { sassPlugin } = require("esbuild-sass-plugin");
let getTemplate = (entry) => `<html><head><meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
<link rel="stylesheet" href="./res/iconfont.css"><link rel="stylesheet" href="./${entry}.css"></head>
<body><script src="./${entry}.js"></script></body></html>`;
let build = async () => {
  let entry = "Index";
  let content = getTemplate(entry);
  await fs.writeFile(`./prod/${entry}.html`, content);
  await esbuild.build({
    entryPoints: [`./src/${entry}.tsx`],
    plugins: [sassPlugin()],
    bundle: true,
    outdir: "prod",
    minify: true,
    sourcemap: false,
  });
};
let start = async () => {
  fs.copySync("./res", "./prod/res");
  await build();
  console.log(`build ok!`);
};
start();
