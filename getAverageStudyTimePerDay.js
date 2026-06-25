'use strict';
// Returns the average study time per day over the given number of days,
// as seconds per day.
module.exports = function getAverageStudyTimePerDay (days = 7) {
  if (!this.days || this.days < days) {
    const firstID = this.db.prepare(`
      select min(id) as id from revlog
    `)
    .get().id || new Date();
    this.days = 1 + Math.floor((new Date() - firstID) / 86400000);
    days = Math.min(days, this.days);
  }

  return Math.floor(
    this.db.prepare(`
      select
        sum(studytime) as time
      from revlog
      where id > ?
    `)
    .get((new Date()) - 86400000 * days).time / days
  );
};
