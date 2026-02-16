import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo connected successfully");
  })
  .catch((err) => {
    console.log("Mongo error: ", err);
  });