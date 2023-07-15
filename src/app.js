const express = require("express");
const http = require("http");
const urlencoded = require("body-parser").urlencoded;
const routes = require("./api/routes/twilio");
const { API_PORT } = require("./config");

const app = express();
app.use(urlencoded({ extended: false }));
app.use("/", routes);

const server = http.createServer(app);
server.listen(API_PORT, () => {
  console.log(`Server listening on port: ${API_PORT}`);
});
