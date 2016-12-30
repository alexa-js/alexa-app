## Changelog

### 2.4.0 (Next)

* [#76](https://github.com/matt-kruse/alexa-app/pull/76): `response.clear()` now sets the default `outputSpeech` to SSML - [@rickwargo](https://github.com/rickwargo).
* [#90](https://github.com/matt-kruse/alexa-app/pull/90): Added [Danger](http://danger.systems), PR linter - [@dblock](https://github.com/dblock).
* [#91](https://github.com/matt-kruse/alexa-app/pull/91): Fixed "Cannot read property 'new' of undefined" init error - [@fremail](https://github.com/fremail).
* [#88](https://github.com/matt-kruse/alexa-app/pull/88), [#92](https://github.com/matt-kruse/alexa-app/pull/92): AudioPlayer functionality - [@wschaeferiii](https://github.com/wschaeferiii) and [@fremail](https://github.com/fremail).
* [#101](https://github.com/matt-kruse/alexa-app/pull/101): Added `request.context` - [@trayburn](https://github.com/trayburn).
* Your contribution here.

### 2.3.4 (May 23, 2016)

* [#68](https://github.com/matt-kruse/alexa-app/pull/68): Added support for custom slot types - [@mutexkid](https://github.com/mutexkid).

### 2.3.3 (May 7, 2016)

* [#59](https://github.com/matt-kruse/alexa-app/pull/59): Added full card type support - [@doapp-ryanp](https://github.com/doapp-ryanp).

### 2.3.2 (Jan 11, 2016)

* [#47](https://github.com/matt-kruse/alexa-app/pull/47): Fixed number output in SSML tags back to being digits - [@rickwargo](https://github.com/rickwargo).
* [#60](https://github.com/matt-kruse/alexa-app/pull/60): Added automated tests for SSML - [@mutexkid](https://github.com/mutexkid).
* [#57](https://github.com/matt-kruse/alexa-app/pull/57): Removed support for no longer used card subtitle - [@rickwargo](https://github.com/rickwargo).

### 2.3.0 (Jan 8, 2016)

* [#46](https://github.com/matt-kruse/alexa-app/pull/46): Added "numbered" to the depencies list in package.json - [@mreinstein](https://github.com/mreinstein).

### 2.3.0 (Jan 4, 2016)

* [#31](https://github.com/matt-kruse/alexa-app/pull/31): Added support for SSML - [@rickwargo](https://github.com/rickwargo).
* [#38](https://github.com/matt-kruse/alexa-app/pull/38): Added `.linkAccount()` method to return Link Account card - [@christianewillman](https://github.com/christianewillman).
* [#37](https://github.com/matt-kruse/alexa-app/pull/37): Added `request.sessionDetails.accessToken` for skills using account linking - [@christianewillman](https://github.com/christianewillman).
* Added MIT license file - [@matt-kruse](https://github.com/matt-kruse).

### 2.2.0 (Oct 26, 2015)

* Bumped alexa-utterances to version 0.1.0 - [@matt-kruse](https://github.com/matt-kruse).
* [#27](https://github.com/matt-kruse/alexa-app/issues/27): Added support for the `exhaustiveUtterances` option in alexa-utterances - [@matt-kruse](https://github.com/matt-kruse).
* By default, alexa-app utterances now avoid the cartesian product of all slot values - [@matt-kruse](https://github.com/matt-kruse).

### 2.1.5 (Oct 25, 2015)

* [#26](https://github.com/matt-kruse/alexa-app/issues/26): Externalized the generation of utterances to the new alexa-utterances module (Issue #26) - [@matt-kruse](https://github.com/matt-kruse).

### 2.1.4 (Sep 14, 2015)

* [#17](https://github.com/matt-kruse/alexa-app/issues/17): Remove hyphen from generated numbers in utterances (Issue #17)
* [#18](https://github.com/matt-kruse/alexa-app/issues/18): Collapse multiple whitespaces to one space in utterances - [@matt-kruse](https://github.com/matt-kruse).
