import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import youtubeRoutes from "./routes/youtube.route.js";
import { NODE_ENV, PORT } from "./config/env.js";
import cookieParser from "cookie-parser";
import path from 'path';

const __dirname = path.resolve();
const app = express();

app.use(cors());
app.use(cookieParser())
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/youtube", youtubeRoutes);

if (NODE_ENV.trim() === "production") {
	console.log(path.join(__dirname, "/frontend/dist"));
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get('*"other-routes"', (req, res) => {
		console.log("Serving frontend for route: ", req.url);
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	console.log("Server running at http://localhost:" + PORT);
});
