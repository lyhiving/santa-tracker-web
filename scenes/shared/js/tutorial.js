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


goog.provide('app.shared.Tutorial');
goog.require('app.shared.utils');

// We are *leaking* the Tutorial global for backwards compatibility.
app.shared.Tutorial = Tutorial;

/**
 * Tutorial animation. Just creates `<santa-tutorial>` in the parent element.
 *
 * @constructor
 * @param {!Element|!jQuery} elem The module element.
 * @param {string} tutorials All tutorials.
 */
function Tutorial(elem, tutorials) {
  this.target_ = app.shared.utils.unwrapElement(elem);

  this.elem_ = document.createElement('santa-tutorial');
  this.elem_.tutorials = tutorials;

  const prev = this.target_.querySelectorAll('santa-tutorial');
  for (let i = 0; i < prev.length; ++i) {
    console.warn('removing old santa-tutorial', prev[i]);
    prev[i].remove();
  }

  // TODO: walk up to top-level?
  this.target_.appendChild(this.elem_);
}

/**
 * Start the tutorial timer.
 */
Tutorial.prototype.start = function() {
  this.elem_.show = true;
};

/**
 * Turn off a tutorial because user has already used the controls.
 *
 * @param {string} name The name of the tutorial.
 */
Tutorial.prototype.off = function(name) {
  // nb. This code doesn't know `santa-tutorial` is a Polymer element.
  /** @suppress {missingProperties} */
  this.elem_.dismiss(name);
};

/**
 * Cleanup.
 */
Tutorial.prototype.dispose = function() {
  this.elem_.remove();
};
