import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { connectDB } from "./lib/db.js";
import http from "http";

const app: Express = express();

connectDB().catch(err => {
  logger.error({ err }, "Failed to connect to MongoDB on startup");
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// ── Dev: proxy all non-API requests to the Vite frontend ────────────────────
// This lets port 80 (backend) serve the frontend preview seamlessly.
if (process.env.NODE_ENV !== "production") {
  const FRONTEND_PORT = process.env.FRONTEND_PORT ?? "25383";
  const FRONTEND_HOST = "127.0.0.1";

  app.use((req: Request, res: Response) => {
    const options: http.RequestOptions = {
      hostname: FRONTEND_HOST,
      port: Number(FRONTEND_PORT),
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${FRONTEND_HOST}:${FRONTEND_PORT}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", () => {
      if (!res.headersSent) {
        res.status(503).send("Frontend not ready yet — start the `frontend: web` workflow.");
      }
    });

    if (req.body && Object.keys(req.body).length > 0) {
      proxyReq.write(JSON.stringify(req.body));
    }

    req.pipe(proxyReq, { end: true });
  });
}

export default app;
