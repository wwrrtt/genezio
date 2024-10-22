import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World from Express serverless!");
});

app.get("/users", (req, res) => {
  res.json([{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]);
});

app.listen(8080, () => {
    console.log(
      "Server is running on port 8080. Check the app on http://localhost:8080"
    );
});