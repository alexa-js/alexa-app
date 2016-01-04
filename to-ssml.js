/**
 Copyright 2015 Rick Wargo. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

var Numbered = require('numbered');

'use strict';

// Util functions for generating valid SSML from plain text
// ========================================================

var ssml = (function () {
    return {
        fromStr: function (str, current_ssml) {
            if (current_ssml) {
                current_ssml = current_ssml.replace(/<speak>/gi, ' ').replace(/<\/speak>/gi, ' ').trim()
            } else {
                current_ssml = '';
            }
            if (str.match(/[0-9]/)) {
                str = str.replace(/[0-9]+(.[0-9])?(?![^<]+>)/g, function (num) {
                    return Numbered.stringify(num).replace(/-/g, ' ');
                });
            }
            //TODO: Need a library with how to easily construct these statements with appropriate spacing, etc.
            //TODO: make sure all attribute values are surrounded by "..."
            var ssml_str = '<speak>' + current_ssml + (current_ssml === '' ? '' : ' ') + str + '</speak>';
            return ssml_str.replace(/  +/, ' ');
        },
        cleanse: function(str) {
            return str.replace(/<\/?(speak|break|phoneme|say-as|p\b|s\b|w\b)[^>]*>/gi, ' ').replace(/  +/, ' ');
        }
    }
})();

module.change_code = 1;
module.exports = ssml;
