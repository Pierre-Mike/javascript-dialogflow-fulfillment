const welcome = require("./intents/welcome");
const reset = require("./intents/reset");

function getMapIntents() {
  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("reset", reset);
  return intentMap;
}

module.exports = getMapIntents;
