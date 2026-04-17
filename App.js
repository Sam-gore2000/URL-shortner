import { readFile } from 'fs/promises';
import { createServer } from 'http';

const urlDatabase = {}; // in-memory storage

function generateCode() {
  return Math.random().toString(36).substring(2, 7);
}

const server = createServer(async (req, res) => {
  try {
    // ================== GET ==================
    if (req.method === "GET") {

      if (req.url === "/") {
        const data = await readFile("./index.html");
        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(data);
      }

      if (req.url === "/style.css") {
        const data = await readFile("./style.css");
        res.writeHead(200, { "Content-Type": "text/css" });
        return res.end(data);
      }

      // 🔥 Redirect logic
      const code = req.url.slice(1);
      if (urlDatabase[code]) {
        res.writeHead(302, { Location: urlDatabase[code] });
        return res.end();
      }

      res.writeHead(404);
      return res.end("Short URL not found");
    }

    // ================== POST ==================
    if (req.method === "POST" && req.url === "/shorten") {
      let body = "";

      req.on("data", chunk => {
        body += chunk;
      });

      req.on("end", () => {
        const { url, shortcode } = JSON.parse(body);

        let code = shortcode || generateCode();

        if (urlDatabase[code]) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Shortcode already exists" }));
        }

        urlDatabase[code] = url;

        const shortUrl = `http://localhost:3002/${code}`;

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ shortUrl }));
      });
    }

  } catch (error) {
    console.log(error);
    res.writeHead(500);
    res.end("Server Error");
  }
});

server.listen(3002, () => {
  console.log("Running on http://localhost:3002");
});