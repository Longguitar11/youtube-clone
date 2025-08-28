import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import youtubeRoutes from "./routes/youtube.route.js";
import { NODE_ENV, PORT } from "./config/env.js";
import cookieParser from "cookie-parser";
import path from 'path';

const app = express();
const __dirname = path.resolve();

app.use(cors());
app.use(cookieParser())
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/youtube", youtubeRoutes);

console.log(NODE_ENV)

if (NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get(`*`, (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});
