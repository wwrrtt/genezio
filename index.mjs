import express from "express";
import Serverless from "serverless-http";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World from Express serverless!");
});

// You don't need to listen to the port when using serverless

// app.listen(8080, () => {
//   console.log(
//     "Server is running on port 8080. Check the app on http://localhost:8080"
//   );
// });

export const handler = Serverless(app);
