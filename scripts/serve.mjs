import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import { extname, join, normalize } from "node:path";

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 4173);
const root = process.cwd();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  try {
    const requestPath = request.url === "/" ? "/index.html" : request.url;
    const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(root, safePath);
    const data = await readFile(filePath);
    const contentType = contentTypes[extname(filePath)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    response.end(data);
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

function getIPv4Urls(portNumber) {
  const interfaces = networkInterfaces();
  return Object.values(interfaces)
    .flat()
    .filter((details) => details && details.family === "IPv4" && !details.internal)
    .map((details) => `http://${details.address}:${portNumber}`)
    .filter((value, index, values) => values.indexOf(value) === index);
}

server.listen(port, host, () => {
  const urls = [`http://127.0.0.1:${port}`, ...getIPv4Urls(port)];
  console.log("Tetrosius dev server running at:");
  for (const url of urls) {
    console.log(`  ${url}`);
  }
});
