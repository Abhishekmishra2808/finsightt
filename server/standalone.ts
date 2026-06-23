import "dotenv/config";
import { createApp } from "./app";

const PORT = Number(process.env.PORT) || 3000;
const app = createApp();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
});
