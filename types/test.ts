import * as alexa from 'alexa-app';

const app = new alexa.app('app-name');

app.pre = (request, response, type) => {};
app.post = (request, response, type) => {};

app.launch((request, response) => {});

app.intent('intentName', {
  slots: {},
  utterances: ['do a thing']
}, (request, response) => {
  response.say("Say a thing!")
    .card("Show a card", "Wow, you showed a card!")
    .card({type: "Simple"})
    .shouldEndSession(false, "Reprompt!");
});
