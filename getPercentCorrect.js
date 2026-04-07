/**
 * getPercentCorrect is a private instance method of srf-scheduler.
 *
 * It must be called so that `this` is set to the srf-scheduler instance
 * object.
 *
 * Configuration parameters:
 *  config.percentCorrectWindow
 *  config.matureThreshold
 *  config.maxInterval
 *  config.minPercentCorrectCount
 *
 * getPercentCorrect returns the percentage of reviews that were not ease
 * 'fail', in the window ending at `on`, or 0 if there were fewer than
 * config.minPercentCorrectCount, considering only reviews where
 * lastinterval was between minInterval and maxInterval.
 */
'use strict';

module.exports = function getPercentCorrect (on, window, minInterval, maxInterval) {
  const self = this;
  on ||= Math.floor(Date.now() / 1000);
  window ||= self.config.percentCorrectWindow;
  minInterval ||= self.config.matureThreshold;
  maxInterval ||= self.config.maxInterval;

  const result = self.db.prepare(`
    select
      count() as count,
      avg(
        case ease
        when 'fail' then 0
        else 1
        end
      ) as average
    from revlog
    where
      lastinterval > @minInterval and
      lastinterval < @maxInterval and
      id > @from and
      id < @to
  `)
  .get({
    minInterval: minInterval,
    maxInterval: maxInterval,
    from: (on - window) * 1000,
    to: on * 1000,
  });
  if (result && result.count > self.config.minPercentCorrectCount) {
    console.log('getPercentCorrect - normal return');
    return result.average * 100;
  } else {
    // Ignore the lower interval limit if there are insufficient
    // reviews with greater interval.
    const result = self.db.prepare(`
      select
        count() as count,
        avg(
          case ease
          when 'fail' then 0
          else 1
          end
        ) as average
      from revlog
      where
        lastinterval < @maxInterval and
        id > @from and
        id < @to
    `)
    .get({
      maxInterval: maxInterval,
      from: (on - window) * 1000,
      to: on * 1000,
    });
    console.log('getPercentCorrect - alternate return: ', result);
    if (result && result.count > 0) {
      return result.average * 100;
    } else {
      return 0;
    }
  }
};
