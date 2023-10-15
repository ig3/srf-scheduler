/**
 * adjustCards is a private instance method of srf-scheduler
 *
 * It must be called so that `this` is set to the srf-scheduler instance
 * object.
 *
 * Configuration parameters:
 *  config.percentCorrectTarget
 *  config.learningThreshold
 *  config.maxInterval
 *  config.percentCorrectSensitivity
 *
 * adjustCards gets percent correct and if it is not 0, compares it to
 * percentCorrectTarget. If the error is more than 1, then the interval and
 * due times of all cards with interval between learningThreshold and
 * maxInterval are adjusted in proportion to the error, multiplied by
 * percentCorrectSensitivity.
 */
'use strict';

const getPercentCorrect = require('./getPercentCorrect.js');

// Adjust the interval and due of cards according to the difference between
// 'percent correct' and percentCorrectTarget. Only cards with interval
// between learningThreshold and maxInterval are adjusted. The purpose of
// this is to provide a low latency feedback from error rate (percent
// correct) to interval.
module.exports = function adjustCards () {
  const self = this;

  const percentCorrect = getPercentCorrect.call(self);
  if (percentCorrect) {
    const error = percentCorrect - self.config.percentCorrectTarget;
    if (Math.abs(error) > 1) {
      const adjustment = Math.max(
        -0.5,
        error * self.config.percentCorrectSensitivity
      );
      self.db.prepare(`
        update card
        set
          interval = floor(interval + interval * @adjustment),
          due = floor(due + interval * @adjustment)
        where
          due > @now and
          interval > @minInterval and
          interval < @maxInterval
      `)
      .run({
        adjustment: adjustment,
        minInterval: self.config.learningThreshold,
        maxInterval: self.config.maxInterval,
        now: Math.floor(Date.now() / 1000)
      });
    }
  }
};
