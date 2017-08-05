// TypeScript Version: 2.2

export type RequestHandler = (request: request, response: response) => void;
export type ErrorHandler = (e: any, request: request, response: response) => void;
export type PreOrPostHandler = (request: request, response: response, type: string) => void;

export let apps: object;

export class app {
  constructor(name: string);

  pre: PreOrPostHandler;
  post: PreOrPostHandler;

  name: string;
  messages: any;

  persistentsession: boolean;
  exhaustiveUtterances: boolean;
  error?: ErrorHandler;

  dictionary: any;
  intents: any;

  audioPlayerEventHandlers: any;
  audioPlayer: (eventName: string, func: any) => void;

  launchFunc?: RequestHandler;
  launch: (func: RequestHandler) => void;

  sessionEndedFunc?: RequestHandler;
  sessionEnded: (func: RequestHandler) => void;

  request: (requestJSON: any) => void;
  schema: () => string;
  utterances: () => string;

  handler: (event: string, context: any, callback: (error: Error, response: response) => void) => void;
  lambda: (event: string, context: any, callback: (error: Error, response: response) => void) => void;

  express: (options: ExpressOptions) => void;

  intent: (intentName: string, schema: any, handler: RequestHandler) => void;
}

export class request {
  // return the type of request received (Launchrequest, Intentrequest, sessionEndedrequest)
  type: () => string;

  // return the value passed in for a given slot name
  slot: (slotName: string) => string;

  // return the slot object
  slots: (slotName: string) => slot;

  // the intent's confirmationStatus
  confirmationStatus: string;

  // check if the intent is confirmed
  isConfirmed: () => boolean;

  // return the Dialog object
  getDialog: () => dialog;

  // check if you can use session (read or write)
  hasSession: () => boolean;

  // return the session object
  getSession: () => session;

  // return the request context
  context?: any;

  // the raw request JSON object
  data: any;

  isAudioPlayer: () => boolean;

  isPlaybackController: () => boolean;

  userId?: string;
  applicationId?: string;
}

export class response {
  resolved: boolean;
  response: any;
  sessionObject: session;

  // tell Alexa to say something; multiple calls to say() will be appended to each other
  // all text output is treated as SSML
  say: (phrase: string) => response;

  // empty the response text
  clear: () => response;

  // tell Alexa to re-prompt the user for a response, if it didn't hear anything valid
  reprompt: (phrase: string) => response;

  // return a card to the user's Alexa app
  // for Object definition @see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#card-object
  // skill supports card(String title, String content) for backwards compat of type "Simple"
  card: (title: string|card, content: string) => response;

  // return a card instructing the user how to link their account to the skill
  // this internally sets the card response
  linkAccount: () => response;

  audioPlayerPlay: (playBehavior: string, audioItem: any) => response;

  // play audio stream (send AudioPlayer.Play directive) @see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#play-directive
  // skill supports stream(String url, String token, String expectedPreviousToken, Integer offsetInMilliseconds)
  audioPlayerPlayStream: (playBehavior: string, stream: object) => response;

  // stop playing audio stream (send AudioPlayer.Stop directive)
  audioPlayerStop: () => response;

  // clear audio player queue (send AudioPlayer.ClearQueue directive)
  // clearBehavior is "CLEAR_ALL" by default
  audioPlayerClearQueue: (clearBehavior?: string) => response;

  // tell Alexa whether the user's session is over; sessions end by default
  // you can optionally pass a reprompt message
  shouldEndSession: (end: boolean, reprompt?: string) => response;

  // send the response to the Alexa device (success) immediately
  // this returns a promise that you must return to continue the
  // promise chain. Calling this is optional in most cases as it
  // will be called automatically when the handler promise chain
  // resolves, but you can call it and return its value in the
  // chain to send the response immediately. You can also use it
  // to send a response from `post` after failure.
  send: () => Promise<response>;

  // trigger a response failure
  // the internal promise containing the response will be rejected, and should be handled by the calling environment
  // instead of the Alexa response being returned, the failure message will be passed
  // similar to `response.send()`, you must return the value returned from this call to continue the promise chain
  // this is equivalent to calling `throw message` in handlers
  // *NOTE:* this does not generate a response compatible with Alexa, so when calling it explicitly you may want to handle the response with `.error` or `.post`
  fail: (message: string) => Promise<response>;

  setSessionAttributes: (attributes: any) => void;
  prepare: () => void;

  getDirectives: () => directive[];
  directive: (directive: any) => response;
}

export class directive {
  details: any[];

  set: (directive: any) => void;
  clear: () => void;
}

export class session {
  constructor(session: any);

  isAvailable: () => boolean;
  isNew: () => boolean;

  // set a session variable
  // by default, Alexa only persists session variables to the next request
  // the alexa-app module makes session variables persist across multiple requests
  // Note that you *must* use `.set` or `.clear` to update
  // session properties. Updating properties of `attributeValue`
  // that are objects will not persist until `.set` is called
  set: (attributeName: string, attributeValue: any) => void;

  // return the value of a session variable
  get: (attributeName: string) => any;

  // session details, as passed by Amazon in the request
  // for Object definition @see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#session-object
  details: any;

  attributes: any;
  sessionId?: string;

  clear: (key: string) => boolean;

  getAttributes: () => any;
}

export class slot {
  constructor(slot: any);

  name: string;
  value: string;
  confirmationStatus: string;

  isConfirmed: () => boolean;
}

export class dialog {
  constructor(dialogState: string);

  isStarted: () => boolean;
  isInProgress: () => boolean;
  isCompleted: () => boolean;

  handleDialogDelegation: (func: RequestHandler) => void;
}

export interface card {
  text?: string;
  content?: string;
  permissions?: string;
  image?: {
    smallImageUrl?: string;
    largeImageUrl?: string;
  };
}

export interface ExpressOptions {
  expressApp: any;
  router: any;
  endpoint: string;
  checkCert: boolean;
  debug: boolean;
  preRequest: PreOrPostHandler;
  postRequest: PreOrPostHandler;
}
