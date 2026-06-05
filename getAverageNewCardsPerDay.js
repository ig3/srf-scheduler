'use strict';
// Returns the average number of new cards per day (24 hours)
// over the sliding window of the given number of days.
module.exports = function getAverageNewCardsPerDay (days = 14) {
  const self = this;

  const newCards = self.db.prepare(`
    select count(case when lastinterval = 0 then 1 end) as n
    from revlog
    where id > ((unixepoch() - ? * 68400) * 1000)
  `)
  .get(days).n;

  return newCards / days;
};
