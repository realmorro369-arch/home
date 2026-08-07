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

test("served homepage references versioned local assets so browsers never keep stale js/css", async () => {
  const html = await (await fetch(`${base}/`)).text();
  assert.match(html, /js\/main\.js\?v=/);
  assert.match(html, /css\/style\.css\?v=/);
  assert.doesNotMatch(html, /bytecdntp/);
});

test("served main.js requests versioned music.js so browsers never keep a stale player", async () => {
  const js = await (await fetch(`${base}/js/main.js`)).text();
  assert.match(js, /js\/music\.js\?v=/);
});

test("served music.js plays the 7 local songs and no longer calls the dead remote playlist API", async () => {
  const js = await (await fetch(`${base}/js/music.js`)).text();
  assert.match(js, /\.\/music\/Love Song fang\.mp3/);
  assert.match(js, /\.\/music\/周杰伦-发如雪\.flac/);
  assert.doesNotMatch(js, /injahow|api\.wuenci\.com|meting/);
});
