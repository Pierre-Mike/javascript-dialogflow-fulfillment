# javascript-dialogflow-fulfillment

Dialogflow fulfillment app nodeJs, express

## Requirements

- Node js
- DialogFlow account
- Heroku, EC2 ... (Any Node js Server could work)
- FetchService Api Key

## Run

- Run the app locally

```
npm start
```

- run ngrok (get a public Url for dialogFlow fulfillment )

```
npm run ngrok
```

## Test

### you can use Postman and send

```
{
  "queryResult": {
    "action": "action name",
    "parameters": {
      "param": "param value"
    },
    "intent": {
      "displayName": "reset"
    }
  }
}
```
