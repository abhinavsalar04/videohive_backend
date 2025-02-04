import "./dotenvConfig.js";
import connectDB from "./db/dbConnection.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Express error: ", error);
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is running at port ${process.env.PORT} 🚀🚀🚀`);
    });
  })
  .catch((error) => {
    console.log("Mongo DB connection failed ⚠️⚠️ ", error);
  });
