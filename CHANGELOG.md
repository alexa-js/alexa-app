## Changelog

### 4.2.3 (October 28, 2018)

* [#344](https://github.com/alexa-js/alexa-app/pull/344): Add coveralls as a check for pull requests - [@kobim](https://github.com/kobim).
* [#352](https://github.com/alexa-js/alexa-app/pull/352): Allow utterance expansion in custom slot type synonyms - [@daanzu](https://github.com/daanzu).
* [#361](https://github.com/alexa-js/alexa-app/pull/361): Fix object reference for dialogState in in doc - [@Sephtenen](https://github.com/Sephtenen).
* [#364](https://github.com/alexa-js/alexa-app/pull/364): Fix reprompt() to concatenate multiple SSML prompts - [@andrewjhunt](https://github.com/andrewjhunt).
* [#371](https://github.com/alexa-js/alexa-app/pull/371): Call response.prepare() after post() - [@fremail](https://github.com/fremail).
* [#373](https://github.com/alexa-js/alexa-app/pull/373): Keep multiple newlines in card output - [@kielni](https://github.com/kielni) and [@fremail](https://github.com/fremail).
* [#374](https://github.com/alexa-js/alexa-app/pull/374): Added Router - [@fremail](https://github.com/fremail).

### 4.2.2 (April 7, 2018)

* [#315](https://github.com/alexa-js/alexa-app/pull/315): Fix card tests and required card type - [@kobim](https://github.com/kobim).
* [#314](https://github.com/alexa-js/alexa-app/pull/314): Fix handling of `undefined` slot values - [@User1m](https://github.com/user1m).
* [#322](https://github.com/alexa-js/alexa-app/pull/322): Included Skill Builder example in example.ejs - [@funkydan2](https://github.com/funkydan2).
* [#324](https://github.com/alexa-js/alexa-app/pull/324): Added TypeScript declarations for the Alexa address objects - [@CodeCutterUK)](https://github.com/CodeCutterUK).
* [#329](https://github.com/alexa-js/alexa-app/pull/329): Run dtslint only on the latest node version - [@kobim](https://github.com/kobim).
* [#313](https://github.com/alexa-js/alexa-app/pull/313): Add general support for upcoming request types - [@matt-kruse](https://github.com/matt-kruse).
* [#330](https://github.com/alexa-js/alexa-app/pull/330): Making coveralls work again - [@kobim](https://github.com/kobim).

### 4.2.1 (February 1, 2018)

* [#284](https://github.com/alexa-js/alexa-app/pull/284): Add support for generating `ask-cli`-compatible schema JSON - [@lazerwalker](https://github.com/lazerwalker).
* [#301](https://github.com/alexa-js/alexa-app/pull/301): Updated alexa-verifier-middleware to v1.0.0 - [@tejashah88](https://github.com/tejashah88).
* [#302](https://github.com/alexa-js/alexa-app/pull/302): Move typescript and dtslint from optionalDependencies to devDependencies - [@lazerwalker](https://github.com/lazerwalker).
* [#310](https://github.com/alexa-js/alexa-app/pull/310): Added support for slot resolutions - [@kobim](https://github.com/kobim).
* [#316](https://github.com/alexa-js/alexa-app/pull/3107): Fix dtslint failures - [@lazerwalker](https://github.com/lazerwalker)

### 4.2.0 (September 13, 2017)

* [#280](https://github.com/alexa-js/alexa-app/pull/280): Fix session typing - [@benestem](https://github.com/benestem).
* [#271](https://github.com/alexa-js/alexa-app/pull/271): Update request typing - [@jontg](https://github.com/jontg).
* [#269](https://github.com/alexa-js/alexa-app/pull/269): Fix the lambda() type definition - [@jontg](https://github.com/jontg).
* [#268](https://github.com/alexa-js/alexa-app/pull/268): Add support for outputting new Skill Builder schema - [@lazerwalker](https://github.com/lazerwalker).
* [#273](https://github.com/alexa-js/alexa-app/pull/273): Correct inconsistent slots API documentation and interface definitions - [@padraigkitterick](https://github.com/padraigkitterick).
* [#274](https://github.com/alexa-js/alexa-app/pull/274): Correct inconsistent interface definitions for optional ExpressOptions properties - [@lazerwalker](https://github.com/lazerwalker).
* [#275](https://github.com/alexa-js/alexa-app/pull/275): Add support for custom slot types (for Skill Builder schema output) - [@lazerwalker](https://github.com/lazerwalker).
* [#276](https://github.com/alexa-js/alexa-app/pull/276): Added documentation for building SSML responses - [@tejashah88](https://github.com/tejashah88).
* [#278](https://github.com/alexa-js/alexa-app/pull/278): Adds type checking for unit tests, and fixes some incorrect TypeScript type definitions - [@lazerwalker](https://github.com/lazerwalker).

### 4.1.0 (August 12, 2017)

* [#265](https://github.com/alexa-js/alexa-app/pull/265): Added support for Display.ElementSelected - [@jstreb](https://github.com/jstreb)
* [#97](https://github.com/alexa-js/alexa-app/pull/97): Added support for custom directives - [@ajcrites](https://github.com/ajcrites).
* [#248](https://github.com/alexa-js/alexa-app/pull/248): Add support for intent and slot `confirmationStatus` - [@sbonami](https://github.com/sbonami).
* [#250](https://github.com/alexa-js/alexa-app/pull/250): Add support for handling and/or delegating Dialog - [@sbonami](https://github.com/sbonami).
* [#258](https://github.com/alexa-js/alexa-app/pull/258): Fix ability to edit request.type() in app.pre - [@samueljr](https://github.com/samueljr).
* [#266](https://github.com/alexa-js/alexa-app/pull/266): Add TypeScript definitions - [@lazerwalker](https://github.com/lazerwalker).

### 4.0.1 (May 17, 2017)

* [#236](https://github.com/alexa-js/alexa-app/pull/236): Update `ssml.cleanse` to stop removing spaces before decimals - [@aminimalanimal](https://github.com/aminimalanimal).
* [#215](https://github.com/alexa-js/alexa-app/pull/215): Fixed `session.details` to match with session in the request object - [@danielstieber](https://github.com/danielstieber).
* [#223](https://github.com/alexa-js/alexa-app/issues/223): Added support for `AskForPermissionsConsent` cards - [@ericblade](https://github.com/ericblade).
* [#219](https://github.com/alexa-js/alexa-app/pull/219): Preserve session when clearing non-existent attribute - [@adrianba](https://github.com/adrianba).
* [#218](https://github.com/alexa-js/alexa-app/pull/218): Fix cert check test cases - [@adrianba](https://github.com/adrianba).
* [#220](https://github.com/alexa-js/alexa-app/pull/220): No longer compatible with Node 0.12 - [@adrianba](https://github.com/adrianba).

### 4.0.0 (March 20, 2017)

* [#134](https://github.com/alexa-js/alexa-app/issues/134): Asynchronous support purely through Promises, removed `return false`/callback support - [@ajcrites](https://github.com/ajcrites).
* [#22](https://github.com/alexa-js/alexa-app/issues/22): Asynchronous support for `pre` and `post` - [@ajcrites](https://github.com/ajcrites).
* [#188](https://github.com/alexa-js/alexa-app/issues/188): Use `callback` to complete lambda functions rather than `context`. - [@ajcrites](https://github.com/ajcrites).
* [#199](https://github.com/alexa-js/alexa-app/issues/199): Add support for `PlaybackController` events - [@tternes](http://github.com/tternes).
* [#203](https://github.com/alexa-js/alexa-app/issues/203): Fix: utterances separated by space instead of tab - [@jmihalicza](http://github.com/jmihalicza).

### 3.2.0 (February 24, 2017)

* [#176](https://github.com/alexa-js/alexa-app/pull/176): Express integration now requires either `expressApp` or `router`, but not both - [@bgjehu](https://github.com/bgjehu).
* [#174](https://github.com/alexa-js/alexa-app/pull/174): Always enforce strict header checking - [@tejashah88](https://github.com/tejashah88).
* [#182](https://github.com/alexa-js/alexa-app/issues/182): Fixed user-defined error handler to automatically resolve unresolved responses - [@rickwargo](https://github.com/rickwargo).
* [#184](https://github.com/alexa-js/alexa-app/pull/184): Implemented slot defaults without exceptions - [@rickwargo](https://github.com/rickwargo).

### 3.1.0 (February 13, 2017)

* [#162](https://github.com/alexa-js/alexa-app/issues/162): Fix: do not generate empty slots in schema - [@dblock](https://github.com/dblock).
* [#134](https://github.com/alexa-js/alexa-app/pull/134): Adding deprecation notices for plan to use Promises for async functionality - [ajcrites](https://github.com/ajcrites).

### 3.0.0 (February 6, 2017)

* [#152](https://github.com/alexa-js/alexa-app/issues/152): Mounted a JSON body-parser after verifier middleware and removed `bodyParser.urlencoded` in Express integration - [@dblock](https://github.com/dblock).
* [#150](https://github.com/alexa-js/alexa-app/pull/150): Added `preRequest` and `postRequest` to express integration - [@dblock](https://github.com/dblock).
* [#150](https://github.com/alexa-js/alexa-app/pull/150): Dump schema and utterances in debug mode - [@dblock](https://github.com/dblock).
* [#144](https://github.com/alexa-js/alexa-app/pull/144): Simplified and refactored the `express` interface - [@mreinstein](https://github.com/mreinstein).
* [#141](https://github.com/alexa-js/alexa-app/pull/141): Fail the response on exception in case of AudioPlayer request - [@fremail](https://github.com/fremail).
* [#139](https://github.com/alexa-js/alexa-app/pull/139): Compatibility with Node.js v0.12 - v7 - [@tejashah88](https://github.com/tejashah88).
* [#125](https://github.com/alexa-js/alexa-app/pull/125): Force new when instantiating alexa.app - [@OpenDog](https://github.com/OpenDog).
* [#119](https://github.com/alexa-js/alexa-app/pull/119): Moved to the [alexa-js organization](https://github.com/alexa-js) - [@dblock](https://github.com/dblock).
* [#118](https://github.com/matt-kruse/alexa-app/pull/118), [#117](https://github.com/matt-kruse/alexa-app/issues/117): Prevent updating session attributes directly - [@ajcrites](https://github.com/ajcrites).
* [#133](https://github.com/matt-kruse/alexa-app/pull/133), [#71](https://github.com/matt-kruse/alexa-app/issues/71): Support asynchronous patterns in request handlers - [@ajcrites](https://github.com/ajcrites).
* [#159](https://github.com/alexa-js/alexa-app/pull/159), [#157](https://github.com/alexa-js/alexa-app/issues/157): Fixed `SessionEndedRequest` hangs without a defined `sessionEndedFunc` - [@dblock](https://github.com/dblock).

### 2.4.0 (January 5, 2017)

* [#76](https://github.com/alexa-js/alexa-app/pull/76): `response.clear()` now sets the default `outputSpeech` to SSML - [@rickwargo](https://github.com/rickwargo).
* [#90](https://github.com/alexa-js/alexa-app/pull/90): Added [Danger](http://danger.systems), PR linter - [@dblock](https://github.com/dblock).
* [#91](https://github.com/alexa-js/alexa-app/pull/91): Fixed "Cannot read property 'new' of undefined" init error - [@fremail](https://github.com/fremail).
* [#88](https://github.com/alexa-js/alexa-app/pull/88), [#92](https://github.com/alexa-js/alexa-app/pull/92): AudioPlayer functionality - [@wschaeferiii](https://github.com/wschaeferiii) and [@fremail](https://github.com/fremail).
* [#101](https://github.com/alexa-js/alexa-app/pull/101): Added `request.context` - [@trayburn](https://github.com/trayburn).

### 2.3.4 (May 23, 2016)

* [#68](https://github.com/alexa-js/alexa-app/pull/68): Added support for custom slot types - [@mutexkid](https://github.com/mutexkid).

### 2.3.3 (May 7, 2016)

* [#59](https://github.com/alexa-js/alexa-app/pull/59): Added full card type support - [@doapp-ryanp](https://github.com/doapp-ryanp).

### 2.3.2 (Jan 11, 2016)

* [#47](https://github.com/alexa-js/alexa-app/pull/47): Fixed number output in SSML tags back to being digits - [@rickwargo](https://github.com/rickwargo).
* [#60](https://github.com/alexa-js/alexa-app/pull/60): Added automated tests for SSML - [@mutexkid](https://github.com/mutexkid).
* [#57](https://github.com/alexa-js/alexa-app/pull/57): Removed support for no longer used card subtitle - [@rickwargo](https://github.com/rickwargo).

### 2.3.0 (Jan 8, 2016)

* [#46](https://github.com/alexa-js/alexa-app/pull/46): Added "numbered" to the depencies list in package.json - [@mreinstein](https://github.com/mreinstein).

### 2.3.0 (Jan 4, 2016)

* [#31](https://github.com/alexa-js/alexa-app/pull/31): Added support for SSML - [@rickwargo](https://github.com/rickwargo).
* [#38](https://github.com/alexa-js/alexa-app/pull/38): Added `.linkAccount()` method to return Link Account card - [@christianewillman](https://github.com/christianewillman).
* [#37](https://github.com/alexa-js/alexa-app/pull/37): Added `request.sessionDetails.accessToken` for skills using account linking - [@christianewillman](https://github.com/christianewillman).
* Added MIT license file - [@matt-kruse](https://github.com/matt-kruse).

### 2.2.0 (Oct 26, 2015)

* Bumped alexa-utterances to version 0.1.0 - [@matt-kruse](https://github.com/matt-kruse).
* [#27](https://github.com/alexa-js/alexa-app/issues/27): Added support for the `exhaustiveUtterances` option in alexa-utterances - [@matt-kruse](https://github.com/matt-kruse).
* By default, alexa-app utterances now avoid the cartesian product of all slot values - [@matt-kruse](https://github.com/matt-kruse).

### 2.1.5 (Oct 25, 2015)

* [#26](https://github.com/alexa-js/alexa-app/issues/26): Externalized the generation of utterances to the new alexa-utterances module - [@matt-kruse](https://github.com/matt-kruse).

### 2.1.4 (Sep 14, 2015)

* [#17](https://github.com/alexa-js/alexa-app/issues/17): Remove hyphen from generated numbers in utterances - [@matt-kruse](https://github.com/matt-kruse).
* [#18](https://github.com/alexa-js/alexa-app/issues/18): Collapse multiple whitespaces to one space in utterances - [@matt-kruse](https://github.com/matt-kruse).
