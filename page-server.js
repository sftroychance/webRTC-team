import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
const PORT = 3301;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

// app.get("/vid", (req, res) => {
//   res.sendFile(path.join(__dirname, "/public/vid.html"));
// });

// app.get("/test", (req, res) => {
//   res.sendFile(path.join(__dirname, "/public/testconn.html"));
// });

const server = app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
