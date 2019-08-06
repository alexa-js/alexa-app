// TypeScript Version: 2.5

import * as alexa from "./alexa";

export * from "./alexa";

export type RequestHandler = (request: request, response: response) => void;
export type ErrorHandler = (e: any, request: request, response: response) => void;

export let apps: {[name: string]: app};

export class app {
  constructor(name?: string);

  /**
   * Executed before any event handlers. This is useful to setup new sessions,
   * validate the applicationId, or do any other kind of validations.
   * You can perform asynchronous functionality in pre by returning a Promise.
   */
  pre: (request: request, response: response, type: string) => void;

  /**
   * The last thing executed for every request. It is even called if there is
   * an exception or if a response has already been sent. The post() function
   * can change anything about the response. It can even turn a return
   * response.fail() into a return respond.send() with entirely new content. If
   * post() is called after an exception is thrown, the exception itself will
   * be the 4th argument.
   *
   * You can perform asynchronous functionality in `post` by returning a
   * Promise similar to pre or any of the handlers.
   */
  post: (request: request, response: response, type: string, exception: any) => void;

  name: string;
  invocationName?: string;
  messages: any;

  /**
   * By default, alexa-app will persist every request session attribute into
   * the response. This way, any session attributes you set will be sent on
   * every subsequent request, as is typical in most web programming
   * environments. If you wish to disable this feature, you can do so by
   * setting app.persistentSession to false.
   */
  persistentSession: boolean;

  /** Use a minimal set of utterances or the full cartesian product */
  exhaustiveUtterances: boolean;

  /** A catch-all error handler that does nothing by default */
  error?: ErrorHandler;

  /**
   * A mapping of keywords to arrays of possible values, for expansion of sample utterances
   */
  dictionary: any;

  intents: {[name: string]: intent};
  intent: (intentName: string, schema?: IntentSchema | RequestHandler, handler?: RequestHandler) => void;

  customSlots: {[name: string]: CustomSlot};
  customSlot: (name: string, values: Array<CustomSlot|string>) => void;

  // TODO
  audioPlayerEventHandlers: any;
  audioPlayer: (eventName: string, func: RequestHandler) => void;

  launchFunc?: RequestHandler;
  launch: (func: RequestHandler) => void;

  sessionEndedFunc?: RequestHandler;
  sessionEnded: (func: RequestHandler) => void;

  displayElementSelectedFunc?: RequestHandler;
  displayElementSelected: (func: RequestHandler) => void;

  playbackControllerEventHandlers: {[name: string]: PlaybackController};
  playbackController: (eventName: string, func: RequestHandler) => void;

  requestHandlers: {[name: string]: RequestHandler};
  on: (handlerName: string, handler: RequestHandler) => void;

  /** TODO: Figure out what the promise actually contains */
  request: (requestJSON: alexa.Request) => Promise<alexa.ResponseBody>;

  /**
   * @deprecated It's recommended you directly call `app.schema.*` instead
   * Extracts the schema and generates a schema JSON object
   * This is equivalent to calling `app.schemas.intent()`
   */
  schema: () => string;

  /** Functions to generate schema JSON objects in Amazon's various formats */
  schemas: {
    /** Generates a schema in the old default intent format */
    intent(): string;

    /** Generates a schema in the new Skill Builder beta format */
    skillBuilder(): string;

    /**
     * Generates a schema in the modified Skill Builder format accepted by the ask-cli tool
     * @param invocationName The invocation name to include in the resulting JSON.
     * If present, invocationName will be used. Otherwise, if app.invocationName is set,
     * it will be used. Otherwise, it will default to app.name.
     */
    askcli(invocationName?: string): string;
  };

  /** Generates a list of sample utterances */
  utterances: () => string;

  /**
   * A built-in handler for AWS Lambda
   * The "context" param is not actually used in code, but appears for
   * backwards comaptibility purposes.
   */
  handler: (event: alexa.RequestBody, context: any, callback: (error: Error, response: alexa.ResponseBody) => void) => void;

  /** For backwards compatibility */
  lambda: () => (event: alexa.RequestBody, context: any, callback: (error: Error, response: response) => void) => void;

  /**
   * attach Alexa endpoint to an express router
   *
   * @param object options.expressApp the express instance to attach to
   * @param router options.router router instance to attach to the express app
   * @param string options.endpoint the path to attach the router to (e.g., passing 'mine' attaches to '/mine')
   * @param bool options.checkCert when true, applies Alexa certificate checking (default true)
   * @param bool options.debug when true, sets up the route to handle GET requests (default false)
   * @param bool options.betaSchema when true, Express debug requests will use the new Skill Builder Beta schema
   * @param function options.preRequest function to execute before every POST
   * @param function options.postRequest function to execute after every POST
   * @throws Error when router or expressApp options are not specified
   * @returns this
   */
  express: (options: ExpressOptions) => void;
}

export class request {
  constructor(json: alexa.RequestBody)

  /** Returns the type of request received (LaunchRequest, IntentRequest, or SessionEndedRequest) */
  type: () => "LaunchRequest"|"IntentRequest"|"SessionEndedRequest";

  /** Returns the value passed in for a given slot name. */
  slot: (slotName: string, defaultValue?: string) => string;

  /** slots['slotname'] returns the slot object */
  slots: {[name: string]: slot};

  /** The intent's confirmationStatus */
  confirmationStatus: string;

  /** Check if the intent is confirmed */
  isConfirmed: () => boolean;

  /** Return the Dialog object */
  getDialog: () => dialog;

  /** Check if you can use session (read or write) */
  hasSession: () => boolean;

  /** Returns the session object */
  getSession: () => session;

  /** Returns the request context */
  context: alexa.Context;

  /** The raw request JSON object from Amazon */
  data: alexa.RequestBody;

  isAudioPlayer: () => boolean;

  isPlaybackController: () => boolean;

  userId?: string;
  applicationId?: string;

  /** This will only exist if the request type is `AudioPlayer` */
  selectedElementToken?: string;

  /** @deprecated */
  session: (key: string) => any;

  /** Returns router object to switch request to some intent, event handler, etc. */
  getRouter: () => router;
}

export class response {
  resolved: boolean;
  response: alexa.ResponseBody;
  sessionObject: session;

  /**
   * Tells Alexa to say something; multiple calls to say() will be appended
   * to each other. All text output is treated as SSML
   */
  say: (phrase: string) => response;

  /** Empties the response text */
  clear: () => response;

  /**
   * Tells Alexa to re-prompt the user for a response, if it didn't hear anything valid.
   * Multiple calls to reprompt() will be appended to each other.
   */
  reprompt: (phrase: string) => response;

  /**
   * Returns a card to the user's Alexa app.
   * Supports card(String title, String content) for backwards compat of type "Simple"
   */
  card: (title: string|alexa.Card, content?: string) => response;

  /**
   * Return a card instructing the user how to link their account to the skill.
   * This internally sets the card response
   */
  linkAccount: () => response;

  audioPlayerPlay: (playBehavior: string, audioItem: alexa.AudioItem) => response;

  /**
   * Plays audio stream (sends AudioPlayer.Play directive)
   * @see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#play-directive
   */
  audioPlayerPlayStream: (playBehavior: string, stream: alexa.Stream) => response;

  /** Stops playing audio stream (sends AudioPlayer.Stop directive) */
  audioPlayerStop: () => response;

  /**
   * Clears audio player queue (sends AudioPlayer.ClearQueue directive).
   * clearBehavior is "CLEAR_ALL" by default
   */
  audioPlayerClearQueue: (clearBehavior?: alexa.ClearBehavior) => response;

  /**
   * Tells Alexa whether the user's session is over; sessions end by default.
   * You can optionally pass a reprompt message.
   */
  shouldEndSession: (end?: boolean, reprompt?: string) => response;

  /**
   * Sends the response to the Alexa device (success) immediately.
   * This returns a promise that you must return to continue the
   * promise chain. Calling this is optional in most cases as it
   * will be called automatically when the handler promise chain
   * resolves, but you can call it and return its value in the
   * chain to send the response immediately. You can also use it
   * to send a response from `post` after failure.
   */
  send: () => Promise<response>;

  /**
   * Triggers a response failure.
   * The internal promise containing the response will be rejected, and should be handled by the calling environment.
   * Instead of the Alexa response being returned, the failure message will be passed
   * similar to `response.send()`, you must return the value returned from this call to continue the promise chain.
   * This is equivalent to calling `throw message` in handlers
   * *NOTE:* this does not generate a response compatible with Alexa, so when calling it explicitly you may want to handle the response with `.error` or `.post`
   */
  fail: (message: string) => Promise<response>;

  setSessionAttributes: (attributes: any) => void;
  prepare: () => void;

  getDirectives: () => directive;
  directive: (directive: any) => response;

  /** @deprecated */
  session: (key: string, val?: any) => response;

  /** @deprecated */
  clearSession: (key?: string) => response;
}

// TODO: This is an Amazon-provided interface, but is more of a cluster of a half-dozen different interfaces with no documented parent interface. These are the methods/properties we're actually using.
export class directive {
  details: any[];

  set: (directive: any) => void;
  clear: () => void;
}

export class session {
  constructor(session: alexa.Session);

  isAvailable: () => boolean;
  isNew: () => boolean;

  /**
   * Sets a session variable.
   * By default, Alexa only persists session variables to the next request.
   * The alexa-app module makes session variables persist across multiple requests.
   * Note that you *must* use `.set` or `.clear` to update
   * session properties. Updating properties of `attributeValue`
   * that are objects will not persist until `.set` is called
   */
  set: (attributeName: string, attributeValue: any) => void;

  /** Returns the value of a session variable */
  get: (attributeName: string) => any;

  /**
   * Session details, as passed by Amazon in the request
   * for Object definition @see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#session-object
   */
  details: alexa.Session;

  attributes: any;
  sessionId?: string;

  clear: (key?: string) => boolean;

  getAttributes: () => any;
}

export class router {
  constructor(app: any, request: alexa.Request, response: alexa.Response, request_json: string)

  intent: (intent: string) => Promise<response>;
  launch: () => Promise<response>;
  sessionEnded: () => Promise<response>;
  audioPlayer: (event: string) => Promise<response>;
  playbackController: (event: string) => Promise<response>;
  displayElementSelected: () => Promise<response>;
  custom: (requestType: string) => Promise<response>;
}

export class resolutionValue {
  constructor(value: alexa.ResolutionValue);

  name: string;
  id: string;
}

export class slotResolution {
  constructor(resolution: alexa.AuthorityResolution);

  status: string;
  values: resolutionValue[];

  isMatched: () => boolean;
  /** Returns the first resolution value */
  first: () => resolutionValue;
}

export class slot {
  constructor(slot: alexa.Slot);

  name: string;
  value: string;
  confirmationStatus: string;
  resolutions: slotResolution[];

  isConfirmed: () => boolean;
  /**
   * Returns the `idx` resolution (if any). If `idx` is omitted, returns the first resolution.
   */
  resolution: (idx?: number) => slotResolution;
}

export class dialog {
  constructor(dialogState: alexa.DialogState);

  dialogState: alexa.DialogState;

  /** Check if the intent's dialog is STARTED */
  isStarted: () => boolean;

  /** Check if the intent's dialog is IN_PROGRESS */
  isInProgress: () => boolean;

  /** Check if the intent's dialog is COMPLETED */
  isCompleted: () => boolean;

  handleDialogDelegation: (func: RequestHandler) => void;
}

export class intent {
  name?: string;
  handler?: RequestHandler;
  dialog: dialog;
  slots: object | null;
  utterances: string[];

  isDelegatedDialog: () => boolean;
}

export interface ExpressOptions {
  /** The express instance to attach to */
  expressApp: any;

  /** Router instance to attach to the express app */
  router?: any;

  /** The path to attach the router to (e.g., passing 'mine' attaches to '/mine') */
  endpoint?: string;

  /** When true, applies Alexa certificate checking (default true) */
  checkCert?: boolean;

  /** When true, sets up the route to handle GET requests (default false) */
  debug?: boolean;

  /** Function to execute before every POST. May return altered request JSON, or undefined, or a Promise */
  preRequest?(json: alexa.RequestBody, req: any, res: any): Promise<alexa.RequestBody>|alexa.RequestBody|undefined|void;

  /** Function to execute after every POST. May return altered request JSON, or undefined, or a Promise */
  postRequest?(json: alexa.ResponseBody, req: any, res: any): Promise<alexa.ResponseBody>|alexa.ResponseBody|undefined|void;
}

export interface IntentSchema {
  dialog?: object;
  slots?: object;
  utterances?: string[];
}

export interface CustomSlot {
  value: string;
  synonyms?: string[];
  id?: string|null;
}

export interface PlaybackController {
  name: string;
  function: RequestHandler;
}
