const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "..", "dist");
const outFile = path.join(distDir, "index.cjs");

const code = `
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const port = Number(process.env.PORT) || 5000;
const distDir = path.resolve(__dirname);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", mime[ext] || "application/octet-stream");
    res.statusCode = 200;
    res.end(buf);
  });
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === "/") pathname = "/index.html";
    const filePath = path.join(distDir, pathname);

    if (!filePath.startsWith(distDir)) {
      res.statusCode = 403;
      return res.end("Forbidden");
    }

    fs.stat(filePath, (err, stat) => {
      if (!err && stat && stat.isFile()) return sendFile(res, filePath);
      return sendFile(res, path.join(distDir, "index.html"));
    });
  } catch (e) {
    res.statusCode = 500;
    res.end("Server error");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log("Serving dist on port", port);
});
`;

if (!fs.existsSync(distDir)) {
  console.error("dist folder not found. Run build first.");
  process.exit(1);
}

fs.writeFileSync(outFile, code.trim() + "\n", "utf-8");
console.log("Generated:", outFile);
