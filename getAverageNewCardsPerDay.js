'use strict';
// Returns the average number of new cards per day (24 hours)
// over the sliding window of the given number of days.
module.exports = function getAverageNewCardsPerDay (days = 14) {
  if (!this.studyDays || this.studyDays < days) {
    const firstID = this.db.prepare(`
      select min(id) as id from revlog
    `)
    .get().id || new Date();
    const startOfDay = new Date().setHours(0, 0, 0, 0).valueOf();
    this.studyDays = 2 + Math.floor((startOfDay - firstID) / 86400000);
    days = Math.min(days, this.studyDays);
  }

  const newCards = this.db.prepare(`
    select count(case when lastinterval = 0 then 1 end) as n
    from revlog
    where id > ((unixepoch() - ? * 86400) * 1000)
  `)
  .get(days).n;

  return newCards / days;
};
