/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
'use strict';

goog.provide('app.Utils');


Utils = function() {
};

Utils.CACHE_ = {};

Utils.prototype.capitalize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

Utils.prototype.getTranslation = function(container, key, variable, varValue) {
  var variable = variable || null;
  var varValue = varValue || null;
  var msg = this.getMsgOrNull(container, key, variable, varValue);
  return msg === null ? '[Unknown message: ' + key + ']' : msg;
};

Utils.prototype.getMsgOrNull = function(container, key, variable, varValue) {
  var text = null;

  // Get translated String
  if (!(key in Utils.CACHE_)) {
    var element = container.find('#' + key);
    if (element.length > 0) {
      text = element.text();
      text = text.replace(/\\n/g, '\n');
      Utils.CACHE_[key] = text;
    }
  } else {
    text = Utils.CACHE_[key];
  }

  // Replace value
  console.log('53', text, variable, varValue);
  if (text && variable && varValue) {
    text = this.replaceVarWithValue(text, variable, varValue);
  }

  // Return it
  return text;
};

Utils.prototype.replaceVarWithValue = function(string, variable, varValue) {
  console.log(string, variable, varValue);
  console.log(string.replace('((' + variable + '))', varValue));
  return string.replace('((' + variable + '))', varValue);
};

app.Utils = new Utils();
