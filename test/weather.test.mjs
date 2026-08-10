import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

let server;
let base;

before(async () => {
  server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      const file = join(root, pathname === "/" ? "index.html" : pathname);
      const data = await readFile(file);
      res.writeHead(200, {
        "Content-Type": contentTypes[extname(file)] || "application/octet-stream",
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test("served main.js no longer calls the dead AMap weather API", async () => {
  const js = await (await fetch(`${base}/js/main.js`)).text();
  assert.doesNotMatch(js, /restapi\.amap\.com/);
  assert.doesNotMatch(js, /c577e8a40049cf51879ff72c9dc1ae8e/);
});

test("served main.js uses Open-Meteo for weather", async () => {
  const js = await (await fetch(`${base}/js/main.js`)).text();
  assert.match(js, /api\.open-meteo\.com/);
});

test("served main.js uses a no-registration IP geolocation API with fallback", async () => {
  const js = await (await fetch(`${base}/js/main.js`)).text();
  assert.match(js, /freeipapi\.com/);
  assert.match(js, /ipinfo\.io/);
});
