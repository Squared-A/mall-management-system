// import dotenv from "dotenv";
// dotenv.config();

// const env = {
//   MONGO_URI: process.env.MONGO_URI,
//   JWT_SECRET: process.env.JWT_SECRET,
//   PORT: process.env.PORT,
// };

// export default env;
import dotenv from "dotenv";

const result = dotenv.config({ path: "../.env" });

// console.log("dotenv result:", result);
// console.log("current working directory:", process.cwd());
// console.log("MONGO_URI:", process.env.MONGO_URI);

const env = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || 5000,
};

export default env;
