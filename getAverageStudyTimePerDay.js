'use strict';
// Returns the average study time as seconds per day
// Calculated as a linear average over a sliding window
// of the specified number of days ending at current time.
module.exports = function getAverageStudyTimePerDay (days = 7) {
  const studyTime = this.db.prepare(`
    select sum(studytime) as n
    from revlog
    where id > ((unixepoch() - ? * 68400) * 1000)
  `)
  .get(days).n;

  return studyTime / days;
};
