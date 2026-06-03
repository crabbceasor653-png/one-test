import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.cwd());
const port = 4173;
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const pathname = url.pathname === "/" ? "/preview.html" : url.pathname;
  const filePath = normalize(join(root, decodeURIComponent(pathname)));

  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": types[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
});

await new Promise((resolveListen) => {
  server.listen(port, "127.0.0.1", resolveListen);
});

try {
  const page = await fetch(`http://127.0.0.1:${port}/preview.html`);
  const css = await fetch(`http://127.0.0.1:${port}/src/styles.css`);

  console.log(`preview.html ${page.status}`);
  console.log(`styles.css ${css.status}`);

  if (!page.ok || !css.ok) {
    process.exitCode = 1;
  }
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}
