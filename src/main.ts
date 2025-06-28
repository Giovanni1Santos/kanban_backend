import cors from "cors";
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import helmet from "helmet";
import process from "node:process";
import swaggerUi from "swagger-ui-express";
import dbSequelize, * as db from "./database/configdb.js";
import loggerMiddleware from "./middleware/log.js";
import Todo from "./models/Todo.js";
import User from "./models/User.js";
import protectedRouter from "./routes/protected.js";
import todoRouter from "./routes/todo.js";
import userRouter from "./routes/user.js";

db.connect();

const app = express();

const limiter = rateLimit({
  windowMs: +process.env["RATE_LIMIT_WINDOW_MS"]! || 15 * 60 * 1000,
  max: +process.env["RATE_LIMIT_MAX"]! || 100,
});

app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === "production") {
  app.use(limiter);
}
app.use(loggerMiddleware);

app.use(userRouter);
app.use(protectedRouter);
app.use(todoRouter);

try {
  const swaggerDocument = JSON.parse(
    fs.readFileSync("./swagger.json", "utf-8")
  );
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.error("Erro ao carregar swagger.json:", error);
}

// Endpoint para resetar o banco de dados (Para testes)
app.post("/reset", async (req, res) => {
  await Todo.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
  await dbSequelize.sync({ force: true });

  res.status(200).json({ message: "Banco de dados resetado com sucesso" });
});

app.listen(8080, () => {
  console.log("Servidor ativo na porta 8080");
});
