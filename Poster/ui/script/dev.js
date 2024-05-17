let fs = require("fs").promises;
let esbuild = require("esbuild");
let { sassPlugin } = require("esbuild-sass-plugin");

let getTemplate = (entry) => `<html>
<head>
  <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
  <link rel="stylesheet" href="./res/iconfont.css">
  <link rel="stylesheet" href="./${entry}.css">
</head>
<body>
    <script src="./${entry}.js"></script>
    <script>new EventSource('/esbuild').addEventListener('change', () => location.reload())</script>
</body>
</html>`;

let startDevServer = async () => {
  let entry = "Index";
  let content = getTemplate(entry);
  await fs.writeFile(`./dev/${entry}.html`, content);
  let ctx = await esbuild.context({
    entryPoints: [`./src/${entry}.tsx`],
    plugins: [sassPlugin()],
    bundle: true,
    outdir: "dev",
    sourcemap: true,
  });
  await ctx.watch();
  let { port } = await ctx.serve({
    servedir: "dev",
    port: 4321,
  });
  return `http://localhost:${port}/index.html`;
};
let start = async () => {
  let address = await startDevServer();
  console.log(`start at ${address}`);
};
start();
