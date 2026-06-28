'use strict';
const formatLocalDate = require('./formatLocalDate.js');
// Returns the average study time as seconds per card
// Calculated as a linear average of study time per calendar day
// divided by unique cards per calendar day. Only days with study
// are included in the average. The purpose is to provide an estimate
// of study time in the next 24 hours per card due in the next 24 hours.
module.exports = function getAverageStudyTimePerCard (days = 14) {
  if (this.getAverageStudyTimePerCardCache !== undefined) {
    return this.getAverageStudyTimePerCardCache;
  }
  const hist = this.db.prepare(`
    select
      revdate,
      count(distinct cardid) as n,
      sum(studytime) as t
    from revlog
    group by revdate
    order by revdate desc
    limit ?
  `).all(days + 1);
  // If there are no reviews, default to 30 seconds per card
  if (hist.length === 0) {
    this.getAverageStudyTimePerCardCache = 30;
  } else {
    if (
      hist.length > 1 &&
      hist[0].revdate === formatLocalDate(new Date())
    ) {
      hist.shift();
    }
    let sum = 0;
    hist.forEach(record => {
      sum += record.t / record.n;
    });
    this.getAverageStudyTimePerCardCache = (sum / hist.length);
  }
  setTimeout(
    () => {
      delete this.getAverageStudyTimePerCardCache;
    },
    50
  );
  return this.getAverageStudyTimePerCardCache;
};
