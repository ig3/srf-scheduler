'use strict';
// Returns the average number of new cards per day (24 hours)
// over the sliding window of the given number of days.
module.exports = function getAverageNewCardsPerDay (days = 14) {
  if (!this.days || this.days < days) {
    const firstID = this.db.prepare(`
      select min(id) as id from revlog
    `)
    .get().id || new Date();
    this.days = 1 + Math.floor((new Date() - firstID) / 86400000);
    days = Math.min(days, this.days);
  }

  return this.db.prepare(`
    select count(case when lastinterval = 0 then 1 end) as n
    from revlog
    where id > ?
  `)
  .get((new Date()) - 86400000 * days).n / days;
};
