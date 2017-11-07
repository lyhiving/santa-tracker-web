/*
 * Copyright 2017 Google Inc. All rights reserved.
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

import * as vec from './vec.js';

const slerpRatio = 4;
const accelerationBar = 0.5;
const maximumSpeed = 0.5;
const stopBar = 0.75;  // angle at which we are trying to stop


/**
 * @param {number} v
 * @param {number} low
 * @param {number} high
 * @return {number}
 */
function clamp(v, low, high) {
  if (v < low) {
    return low;
  } else if (v > high) {
    return high;
  }
  return v;
}


export class Character {
  constructor() {
    /** @private {number} */
    this._speed = 0;
    
    /** @private {vec.Vector} */
    this._vec = {x: 1, y: 0};

    /** @private {number} */
    this._line = 0;
  }

  /**
   * @return {number}
   */
  get speed() {
    return this._speed;
  }

  /**
   * @return {number} rotation in rads
   */
  get rotate() {
    return -Math.atan2(this._vec.x, this._vec.y);
  }

  /**
   * @return {number} line width due to rotation
   */
  get lineWidth() {
    return this._line;
  }

  /**
   * @export
   */
  crash() {
    this._speed = 0;
  }

  /**
   * @param {number} delta as fraction of second
   * @param {?vec.Vector=} target relative to character position
   * @return {{x: number, y: number}} amount to move by
   * @export
   */
  tick(delta, target=null) {
    const angle = Math.atan2(this._vec.x, this._vec.y);
    const changeX = Math.sin(angle) * this._speed * delta;
    const changeY = this._speed * this._vec.y * delta;

    if (target) {
      target = vec.unitVec(target);  // deal with bad client data

      // player is drifting "up", so retain vector
      if (target.y < 0 && this._vec.y < stopBar) {
        target = {
          x: Math.sign(this._vec.x),
          y: 0,
        };
      }

      const by = slerpRatio * delta * (1 - this._speed);
      this._vec = vec.slerp(this._vec, target, by);

      this._line = vec.angleBetween(this._vec, target);  // difference between player/goal
    } else {
      this._line = 0;  // character not changing direction
    }

    let accel = Math.cos(angle) - accelerationBar;
    if (accel < 0) {
      accel = Math.tan(accel);
    }
    this._speed = clamp(this._speed + accel * delta, 0, maximumSpeed);

    return {x: changeX, y: changeY};
  }
}
