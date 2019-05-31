"use strict";

const { WebhookClient, Card } = require("dialogflow-fulfillment");
const express = require("express");
const bodyParser = require("body-parser");
/* 
const basicAuth = require("express-basic-auth");
*/

const { google } = require("googleapis");

const CONFIG = process.env.CONFIG ? JSON.parse(process.env.CONFIG) : require("./settings.json") 

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
const state = Math.random()
/* 
app.use(
  basicAuth({
    users: { admin: "supersecret" }
  })
);s
 */

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
  agent.add(`Welcome to Express.JS webhook!`);
}

function connection(agent) {
  const getURLAuthorizarionPlusRessource = () => {
    const redirect_uri = CONFIG.microsoft.redirect_uri;

    var urlAutorization = oauth2.authorizationCode.authorizeURL({
      redirect_uri,
      state
    });
    return urlAutorization + "&resource=https://graph.microsoft.com/";
  };
  agent.add(
    new Card({
      title: "Title: this is a card title",
      imageUrl:
        "http://www.tascmanagement.com/wp-content/uploads/2016/05/course-logo-small-SP-300x250.png",
      text:
        "This is the body text of a card.  You can even use line\n  breaks and emoji! 💁",
      buttonText: "Login",
      buttonUrl: getURLAuthorizarionPlusRessource()
    })
  );
}
function fallback(agent) {
  agent.add(`I didn't understand`);
  agent.add(`I'm sorry, can you try again?`);
}

function getMapIntents() {
  let intentMap = new Map();
  intentMap.set("Check an appointment", check_appointment);
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Login SharePoint", connection);
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
  console.log(req.query);
  const redirect_uri = CONFIG.microsoft.redirect_uri;
  const code = req.query.code;
  const options = {
    code,
    redirect_uri
  };
  const result = await oauth2.authorizationCode.getToken(options);
  console.log("The resulting token: ", result);
  const token = await oauth2.accessToken.create(result).token;
  console.log("token : ", token);
  res.send(JSON.stringify({ TOKEN: token }));
});

app.listen(process.env.PORT || 8080, function() {
  console.info(`Webhook listening on port 8080!`);
});
