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

goog.provide('Controls');

/**
 * Handles user input for controlling the game.
 * @param {!Game} game The game object.
 * @constructor
 */
Controls = function(game) {
  // This is what we're controlling
  this.game = game;
  this.player = this.game.player;
  this.tutorial = this.game.tutorial;
  this.keyDownCounter = 0;

  // Touch state
  this.currentTouchId = null;

  // Let's bind our events.
  var handler = this.handle.bind(this);
  this.game.elem.on('touchstart.boatload touchmove.boatload touchend.boatload', handler);
  $(window).on('keydown.boatload keyup.boatload', handler);
};

/**
 * Keep track of the up key.
 * @type {boolean}
 * @private
 */
Controls.prototype.isUpDown_ = false;

/**
 * Keep track of the down key.
 * @type {boolean}
 * @private
 */
Controls.prototype.isDownDown_ = false;

/**
 * Keep track of the space bar.
 * @type {boolean}
 * @private
 */
Controls.prototype.isSpaceDown_ = false;

/**
 * Keep track of player movements.
 * @type {boolean}
 * @private
 */
Controls.prototype.isMoving_ = false;

/**
 * Touch controls
 * @type {boolean}
 */
Controls.prototype.touchStartedInGUI = false;

/**
 * Handle all keyboard and touch events.
 * @param {!jQuery.Event} e The event data.
 */
Controls.prototype.handle = function(e) {
  // Paused or Gameover
  if (!this.game.isPlaying) {
    return;
  }

  // TODO(samthor): Add all events explicitly, rather than calling by string.
  // Note also that this breaks with ADVANCED_OPTIMIZATIONS since the names are
  // referenced by string.
  var methodName = 'on' + e.type[0].toUpperCase() + e.type.slice(1);
  this[methodName](e.originalEvent);
};

/**
 * Handles the key down event. Called dynamically.
 * @param {!Event} e The event object.
 */
Controls.prototype.onKeydown = function(e) {
  if (e.keyCode === 38) { // Up
    this.isUpDown_ = true;
  } else if (e.keyCode === 40) { // Down
    this.isDownDown_ = true;
  } else if ((e.keyCode === 32 || e.keyCode === 39) && !this.isSpaceDown_) { // Space (and right)
    // Let tutorial know if space or right has been pressed
    // and hide tutorial when user presses the button
    if (!this.spacePressed) {
      this.tutorial.off('keys-space');
      this.spacePressed = true;
    }
    this.isSpaceDown_ = true;
    this.getDistance();
    this.player.preparePresent();
  }

  if (!this.arrowPressed && (e.keyCode === 38 || e.keyCode === 40)) {
    // Let tutorial know if arrow has been pressed
    // and hide tutorial when user presses the button
    this.tutorial.off('keys-updown');
    this.arrowPressed = true;
  }

  this.updatePlayerFromKeyboard();
};

/**
 * Handles the key up event. Called dynamically.
 * @param {!Event} e The event object.
 */
Controls.prototype.onKeyup = function(e) {
  if (e.keyCode === 38) { // Up
    this.isUpDown_ = false;
  } else if (e.keyCode === 40) { // Down
    this.isDownDown_ = false;
  } else if (e.keyCode === 32 || e.keyCode === 39) { // Space (and right)
    this.stopCount = clearInterval(this.timer);
    this.isSpaceDown_ = false;
    this.player.dropPresent();
  }
  this.updatePlayerFromKeyboard();
};

/**
 * Calculate space(and right) key pressed duration.
 */
Controls.prototype.getDistance = function() {
  this.keyDownCounter = 0;
  this.player.distance = 0;
    this.timer = setInterval(() => {
      this.keyDownCounter += 0.15;
      //Add player movement limit. Max 3 to the left.
      if(this.keyDownCounter < 3) {
        this.player.distance = this.keyDownCounter;
      } else {
        this.player.distance = 3;
      }
    }, 10);
};

/**
 * Updates the player.
 */
Controls.prototype.updatePlayerFromKeyboard = function() {
  if (this.isUpDown_) {
    this.player.keyboardGoUp();
  } else if (this.isDownDown_) {
    this.player.keyboardGoDown();
  } else {
    this.player.keyboardStop();
  }

  // Pull sound
  if (!this.isUpDown_ && !this.isDownDown_) {
    this.isMoving_ = false;
  } else if (!this.isMoving_) {
    this.isMoving_ = true;
  }
};

/**
 * Touch started. Ignores gui touches. Called dynamically.
 * @param {!Event} e The event object.
 */
Controls.prototype.onTouchstart = function(e) {
  // Ignore the touch if it starts in GUI
  this.touchStartedInGUI = !!$(e.target).closest('.gui').length;
  if (this.touchStartedInGUI) return;

  // If no end event was fired
  if (this.currentTouchId !== null) {
    this.player.touchEnded();
  }

  // Correct position if game is scaled
  var touch = e.changedTouches[0];
  var touchY = touch.pageY * (1 / this.game.scale);

  this.currentTouchId = touch.identifier;
  this.player.setY(touchY);
  this.getDistance();
  this.player.preparePresent();
  e.preventDefault();

  // Let tutorial know about touch so it can hide the tutorial.
  if (!this.touchStarted) {
    this.tutorial.off('touch-updown');
    this.touchStarted = true;
  }
};

/**
 * Touch moved. Called dynamically.
 * @param {!Event} e The event object.
 */
Controls.prototype.onTouchmove = function(e) {
  var touch = this.getCurrentTouch(e);
  if (touch) {
    // Correct position if game is scaled
    var touchY = touch.pageY * (1 / this.game.scale);

    this.player.setY(touchY);
  }
  e.preventDefault();
};

/**
 * Touch ended. Called dynamically.
 * @param {!Event} e The event object.
 */
Controls.prototype.onTouchend = function(e) {
  var touch = this.getCurrentTouch(e);
  if (!touch) {
    return;
  }
this.stopCount = clearInterval(this.timer);
  this.currentTouchId = null;
  this.player.touchEnded();
};

/**
 * Returns the active touch from a native touch event.
 * @param {!Event} e A touch event.
 * @return {Touch} The active touch.
 */
Controls.prototype.getCurrentTouch = function(e) {
  if (this.currentTouchId === null) {
    return null;
  }

  for (var i = 0, touch; touch = e.changedTouches[i]; i++) {
    if (touch.identifier === this.currentTouchId) {
      return touch;
    }
  }
  return null;
};
