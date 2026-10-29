import { createServer } from "node:http";
import { handleApi } from "./routes.js";
import { sendJson } from "./utils/http.js";
import { serveStatic } from "./utils/static.js";

const port = Number(process.env.PORT || 3002);

const server = createServer(async (request,response) => {
  const url = new URL(request.url || "/",`http://${request.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    try { await handleApi(request,response,url); }
    catch (error) {
      sendJson(response,error.status || 500,{error:error.status ? error.message : "The server could not complete this request."});
      if (!error.status) console.error("API request failed:",error);
    }
    return;
  }
  if (request.method !== "GET") {
    response.writeHead(405,{"allow":"GET"});
    response.end("Method not allowed");
    return;
  }
  serveStatic(url.pathname,response);
});

server.listen(port,process.env.HOST || "127.0.0.1",() => console.log(`AdblissHRM frontend and API listening at http://localhost:${port}`));
