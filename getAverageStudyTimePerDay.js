'use strict';
// Returns the average study time as seconds per day
// Calculated as a linear average over a sliding window
// of the specified number of days ending at current time.
module.exports = function getAverageStudyTimePerDay (days = 7) {
  if (!this.studyDays || this.studyDays < days) {
    const firstID = this.db.prepare(`
      select min(id) as id from revlog
    `)
    .get().id || new Date();
    const startOfDay = new Date().setHours(0, 0, 0, 0).valueOf();
    this.studyDays = 2 + Math.floor((startOfDay - firstID) / 86400000);
    days = Math.min(days, this.studyDays);
  }

  const studyTime = this.db.prepare(`
    select sum(studytime) as n
    from revlog
    where id > ((unixepoch() - ? * 86400) * 1000)
  `)
  .get(days).n;

  return studyTime / days;
};
