"use strict";

const { WebhookClient } = require("dialogflow-fulfillment");
const express = require("express");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");

app.use(
  basicAuth({
    users: { admin: "supersecret" }
  })
);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function welcome(agent) {
  agent.add(`Welcome to Express.JS webhook!`);
}

function fallback(agent) {
  agent.add(`I didn't understand`);
  agent.add(`I'm sorry, can you try again?`);
}

function WebhookProcessing(req, res) {
  const agent = new WebhookClient({ request: req, response: res });
  console.info(`agent set`);
  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  // intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
  agent.handleRequest(intentMap);
}

// Webhook
app.post("/", function(req, res) {
  console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
  WebhookProcessing(req, res);
});

app.get("/", function(req, res) {
  res.send(JSON.stringify({ Hello: `word` }));
});

app.listen(process.env.PORT || 80, function() {
  console.info(`Webhook listening on port 8080!`);
});
