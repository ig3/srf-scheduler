'use strict';
// Returns the average number of reviews per day (24 hours)
// over the sliding window of the given number of days
// ending at the current time.
module.exports = function getAverageReviewsPerDay (days = 14) {
  const reviews = this.db.prepare(`
    select count() as n
    from revlog
    where id > ((unixepoch() - ? * 86400) * 1000)
  `)
  .get(days).n;

  return (reviews / days);
};
