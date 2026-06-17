// Server entry point
import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";

connectDB();

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
