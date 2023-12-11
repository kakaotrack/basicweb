// server.js

const express = require("express");
const path = require("path");
const app = express();
const port = 5000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(port, () => {
    console.log("서버가 정상적으로 실행되었습니다.");
});
