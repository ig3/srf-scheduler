'use strict';

// getWeightedAverageStudyTime returns an exponentially weighted moving
// average to study time, averaging of a window of up to 'days' days of
// study, ignoring days without any study. The exponential decay factor is
// the same as for ease adjustments.
module.exports = function getWeightedAverageStudyTime (days = 7) {
  const self = this;
  const dailyTotals = self.db.prepare(`
    select sum(studytime) as t
    from revlog
    where revdate != (select max(revdate) from revlog)
    group by revdate
    order by revdate desc
    limit ?
  `)
  .all(days);
  let s = 0;
  let d = 0;
  dailyTotals.forEach(record => {
    s = record.t + s * self.config.decayFactor;
    d = 1 + d * self.config.decayFactor;
  });
  return dailyTotals.length ? s / d : 0;
};
