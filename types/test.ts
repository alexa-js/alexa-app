import * as alexa from 'alexa-app';

const app = new alexa.app('app-name');

app.pre = (request, response, type) => {
  if (request.applicationId !== undefined) {
    // As documented in https://github.com/alexa-js/alexa-app#session
    throw new Error('Invalid Application ID');
  }
  if (request.hasSession() && request.getSession().application.applicationId !== undefined) {
    // As documented in https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#session-object
    throw new Error('Invalid Application ID');
  }
};
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

const intentSchema: string = app.schemas.intent();
const skillBuilderSchema: string = app.schemas.skillBuilder();

export const new_handler = app.handler;
export const legacy_handler = app.lambda();
