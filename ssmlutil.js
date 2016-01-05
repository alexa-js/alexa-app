/**
 Copyright 2015 Rick Wargo. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';

var ssml = require('ssml');

// Util functions for generating valid SSML from plain text
// ========================================================

var ssmlutil = (function () {
    return {
        cleanse: function(message) {
            var str = (message instanceof ssml) ? message.toString({minimal: true}) : message;
            str = str.replace(/<\/?(speak|break|phoneme|say-as|p\b|s\b|w\b)[^>]*>/gi, ' ').replace(/  +/, ' ');
            if (message instanceof ssml) {
                str = str.trim();
            }
            return str;
        }
    };
})();

module.change_code = 1;
module.exports = ssmlutil;
