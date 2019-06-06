"use strict";

const { WebhookClient, Card, Suggestion } = require("dialogflow-fulfillment");
const express = require("express");
const bodyParser = require("body-parser");
const NodeCache = require("node-cache");
const cache = new NodeCache();
var graph = require("@microsoft/microsoft-graph-client");

/* 
const basicAuth = require("express-basic-auth");
*/

const { google } = require("googleapis");

const CONFIG = process.env.CONFIG
  ? JSON.parse(process.env.CONFIG)
  : require("./settings.json");

const serviceAccountAuth = new google.auth.JWT({
  email: CONFIG.google.client_email,
  key: CONFIG.google.private_key,
  scopes: "https://www.googleapis.com/auth/calendar"
});
const calendarId = CONFIG.google.calendarId; // looks like "6ujc6j6rgfk02cp02vg6h38cs0@group.calendar.google.com"

const calendar = google.calendar("v3");
const timeZone = "America/Los_Angeles";
const timeZoneOffset = "-07:00";
const credentials = {
  client: {
    id: CONFIG.microsoft.clientId,
    secret: CONFIG.microsoft.secret
  },
  auth: {
    tokenHost: CONFIG.microsoft.loginUrl,
    tokenPath: "/" + CONFIG.microsoft.tenant + CONFIG.microsoft.tokenPath,
    authorizePath:
      "/" + CONFIG.microsoft.tenant + CONFIG.microsoft.authorizePath
  }
};
const oauth2 = require("simple-oauth2").create(credentials);
/* 
app.use(
  basicAuth({
    users: { admin: "supersecret" }
  })  
);
 */

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function getClientGraph(accessToken, apiUrl, search, filter, select) {
  return new Promise((resolve, reject) => {
    var client = graph.Client.init({
      authProvider: done => {
        done(null, accessToken);
      }
    }).api(apiUrl);
    if (search) {
      client.search(search);
    }
    if (filter) {
      client.filter(filter);
    }
    if (select) {
      client.select(select);
    }
    client
      .get()
      .catch(err => reject(err))
      .then(e => resolve(e));
  });
}

function check_appointment(agent) {
  const dateTimeStart = new Date(
    Date.parse(
      agent.parameters.date.split("T")[0] +
        "T" +
        agent.parameters.time.split("T")[1].split("-")[0] +
        timeZoneOffset
    )
  );
  const dateTimeEnd = new Date(
    new Date(dateTimeStart).setHours(dateTimeStart.getHours() + 1)
  );
  const appointmentTimeString = dateTimeStart.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    timeZone: timeZone
  });

  // Check the availibility of the time, and make an appointment if there is time on the calendar
  return createCalendarEvent(dateTimeStart, dateTimeEnd)
    .then(() => {
      agent.add(
        `Ok, let me see if we can fit you in. ${appointmentTimeString} is fine!?`
      );
    })
    .catch(() => {
      agent.add(
        `I'm sorry, there are no slots available for ${appointmentTimeString}.`
      );
    });
}

function createCalendarEvent(dateTimeStart, dateTimeEnd) {
  return new Promise((resolve, reject) => {
    calendar.events.list(
      {
        auth: serviceAccountAuth, // List events for time period
        calendarId: calendarId,
        timeMin: dateTimeStart.toISOString(),
        timeMax: dateTimeEnd.toISOString()
      },
      (err, calendarResponse) => {
        // Check if there is a event already on the Bike Shop Calendar
        if (err || calendarResponse.data.items.length > 0) {
          reject(
            err ||
              new Error("Requested time conflicts with another appointment")
          );
        } else {
          // Create event for the requested time period
          calendar.events.insert(
            {
              auth: serviceAccountAuth,
              calendarId: calendarId,
              resource: {
                summary: "Bike Appointment",
                start: { dateTime: dateTimeStart },
                end: { dateTime: dateTimeEnd }
              }
            },
            (err, event) => {
              err ? reject(err) : resolve(event);
            }
          );
        }
      }
    );
  });
}

function welcome(agent) {
  agent.add("hello express");
}

function getURLAuthorizarionPlusRessource(state) {
  const redirect_uri = CONFIG.microsoft.redirect_uri;
  var urlAutorization = oauth2.authorizationCode.authorizeURL({
    redirect_uri,
    state
  });
  return urlAutorization + "&resource=https://graph.microsoft.com/";
}

async function connection(agent) {
  let state = agent.context.session;
  if (agent.context.get("sharepoint_connection")) {
    agent.add("You are already connected");
    agent.add(new Suggestion("Search Sharepoint"));
    agent.add(new Suggestion("Sharepoint logout"));
  } else {
    agent.context.set({
      name: "sharepoint_connection",
      lifespan: 50,
      parameters: {}
    });
    agent.add(
      new Card({
        title: "Title: this is a card title",
        imageUrl:
          "http://www.tascmanagement.com/wp-content/uploads/2016/05/course-logo-small-SP-300x250.png",
        text:
          "This is the body text of a card.  You can even use line\n  breaks and emoji! 💁",
        buttonText: "Login",
        buttonUrl: getURLAuthorizarionPlusRessource(state)
      })
    );
  }
}
function fallback(agent) {
  agent.add(parameters);
}

function sharepointContext(agent) {
  if (cache.get(agent.context.session, false)) {
    console.log("set from cache to context");
    let param = { access_token: cache.get(agent.context.session) };
    agent.context.set({
      name: "sharepoint_connection",
      lifespan: 50,
      parameters: param
    });
    return param;
  }
  return agent.context.get("sharepoint_connection", {}).parameters;
}

async function search(agent) {
  var cntxtParam = await sharepointContext(agent);
  if ("access_token" in cntxtParam) {
    let me = await getClientGraph(cntxtParam.access_token, "/sites", "test");
    console.log(me);
    me.value.map(e =>
      agent.add(
        new Card({
          title: e.displayName,
          buttonText: e.name,
          buttonUrl: e.webUrl
        })
      )
    );
  } else {
    agent.add("you are not connected !");
    connection(agent);
  }
}

function getMapIntents() {
  let intentMap = new Map();
  intentMap.set("Check an appointment", check_appointment);
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Login SharePoint", connection);
  intentMap.set("Search SharePoint", search);
  intentMap.set("Fallback", fallback);
  return intentMap;
}

function WebhookProcessing(request, response) {
  const agent = new WebhookClient({ request, response });
  let mapIntents = getMapIntents();
  agent.handleRequest(mapIntents);
}

// Webhook
app.post("/", function(req, res) {
  console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
  WebhookProcessing(req, res);
});

app.get("/", function(req, res) {
  res.send(JSON.stringify({ Hello: `word` }));
});

app.get("/getAToken", async function(req, res) {
  const options = {
    code: req.query.code,
    redirect_uri: CONFIG.microsoft.redirect_uri
  };
  const result = await oauth2.authorizationCode
    .getToken(options)
    .catch(e => console.log(e));
  const access_token = oauth2.accessToken.create(result).token.access_token;

  cache.set(req.query.state, access_token, 100000000);

  res.send(JSON.stringify(cache.get(req.query.state)));
});

app.listen(process.env.PORT || 8080, function() {
  console.info(`Webhook listening on port 8080!`);
});
