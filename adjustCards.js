/**
 * adjustCards is a private instance method of srf-scheduler
 *
 * It must be called so that `this` is set to the srf-scheduler instance
 * object.
 *
 * Configuration parameters:
 *  config.percentCorrectTarget
 *  config.percentCorrectSensitivity
 *  config.learningThreshold
 *  config.maxInterval
 *
 * Adjust interval and due according to percent correct. The adjustment
 * varies with the difference of percent correct and percentCorrectTarget,
 * maxInterval and average reviews per day. The objective is to achieve
 * target percent correct by decreasing intervals when percent correct is
 * lower and increasing intervals when it is higher than the target.
 *
 * Cards are adjusted only if getPercentCorrect returns a value, and only
 * for cards with intervals between learningThreshold and maxInterval.
 */
'use strict';

const getPercentCorrect = require('./getPercentCorrect.js');
const getAverageReviewsPerDay = require('./getAverageReviewsPerDay.js');

module.exports = function adjustCards () {
  const self = this;

  const percentCorrect = getPercentCorrect.call(self);
  if (percentCorrect) {
    const adjustment =
      Math.floor(
        (percentCorrect - self.config.percentCorrectTarget) *
        self.config.percentCorrectSensitivity *
        self.config.maxInterval /
        (getAverageReviewsPerDay.call(self) + 1)
      );
    if (adjustment !== 0) {
      self.db.prepare(`
        update card
        set
          interval = interval + @adjustment,
          due = due + @adjustment
        where
          due > @now and
          interval > @minInterval and
          interval < @maxInterval
      `)
      .run({
        adjustment: adjustment,
        minInterval: self.config.learningThreshold,
        maxInterval: self.config.maxInterval,
        now: Math.floor(Date.now() / 1000),
      });
    }
  }
};
