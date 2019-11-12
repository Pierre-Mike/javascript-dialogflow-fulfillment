"use strict";
const { WebhookClient } = require("dialogflow-fulfillment");
const express = require("express");
const bodyParser = require("body-parser");
const { CONFIG, cache, oauth2 } = require("./lib/lib");

const intents = require("./intents");

const basicAuth = require("express-basic-auth");

const app = express();
/* require an authentication */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function WebhookProcessing(request, response) {
  const agent = new WebhookClient({ request, response });
  agent.handleRequest(intents());
}

// Webhook
app.post("/", basicAuth(CONFIG.auth), (req, res) => {
  console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
  WebhookProcessing(req, res);
});

app.get("/", (req, res) => {
  res.send("Test");
});
