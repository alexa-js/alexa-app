export type DialogState = "STARTED"|"IN_PROGRESS"|"COMPLETED";
export type ClearBehavior = "CLEAR_ENQUEUED"|"CLEAR_ALL";
export type Request = LaunchRequest|IntentRequest|SessionEndedRequest; // TODO: A request can also be a few other things we don't handle (e.g. AudioPlayer request, Dispay.RenderTemplate request, etc)

export interface AudioItem {
  stream: Stream;
}

export interface AudioPlayer {
  token: string;
  offsetInMilliseconds: number;
  playerActivity: "IDLE"|"PAUSED"|"PLAYING"|"BUFFER_UNDERRUN"|"FINISHED"|"STOPPED";
}

export interface Card {
  type: "Simple"|"Standard"|"LinkAccount";
  text?: string;
  content?: string;
  image?: {
    smallImageUrl?: string;
    largeImageUrl?: string;
  };
}
// @see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#context-object
export interface Context {
  System: System;
  AudioPlayer: AudioPlayer;
}

export interface Intent {
  name: string;
  confirmationStatus: "NONE"|"CONFIRMED"|"DENIED";
  slots: {[name: string]: Slot};
}

export interface IntentRequest {
  type: "IntentRequest";
  requestId: string;
  timestamp: string; // ISO-8601
  dialogState: DialogState;
  intent: Intent;
  locale: string;
}

export interface LaunchRequest {
  type: "LaunchRequest";
  timestamp: string; // ISO-8601;
  requestId: string;
  locale: string;
}

export interface OutputSpeech {
  type: "PlainText"|"SSML";
  text?: string;
  ssml?: string;
}

export interface Permissions {
  consentToken: string;
}

export interface RequestBody {
  version: string;
  session: Session;
  context: Context;
  request: Request;
}

export interface Response {
  outputSpeech?: OutputSpeech;
  card?: Card;
  reprompt?: {
    outputSpeech?: OutputSpeech;
  };
  shouldEndSession?: boolean;
  directives: any[]; // TODO
}

export interface ResponseBody {
  version: string;
  sessionAttributes: string;
  response: Response;
}

// @see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#session-object
export interface Session {
  new: boolean;
  sessionId: string;
  attributes: any;
  application: {
    applicationId: string;
  };
  user: User;
}

export interface SessionEndedRequest {
  type: "SessionEndedRequest";
  requestId: string;
  timestamp: string; // ISO-8601;
  reason: "USER_INITIATED"|"ERROR"|"EXCEEDED_MAX_REPROMPTS";
  locale: string;
  error: {
    type: "INVALID_RESPONSE"|"DEVICE_COMMUNICATION_ERROR"|"INTERNAL_ERROR";
    message: string;
  };
}
export interface Slot {
  name: string;
  value: string;
  confirmationStatus: "NONE"|"CONFIRMED"|"DENIED";
  resolutions: any; // TODO
}

export interface Stream {
  url: string;
  token: string;
  expectedPreviousToken?: string;
  offsetInMilliseconds: number;
}

export interface System {
  application: {
    applicationId: string;
  };

  user: User;

  device: {
    deviceId: string;
    supportedInterface: string[]; // TODO: Think this may be weirder?
  };

  apiEndpoint: string;
}

export interface User {
    userId: string;
    accessToken?: string;
    permissions?: Permissions;
}
