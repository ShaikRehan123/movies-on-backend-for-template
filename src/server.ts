import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { sellerRoutes, userRoutes, adminRoutes } from "./routes";
dotenv.config({
  path: "./env",
});
import path from "path";
const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());

app.use("/user", userRoutes);
app.use("/seller", sellerRoutes);
app.use("/admin", adminRoutes);

// app.use((req: Request, res: Response, next: NextFunction) => {
//   return res.redirect("/404.html");
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
