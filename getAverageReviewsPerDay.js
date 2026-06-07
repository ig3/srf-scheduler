'use strict';
// Returns the average number of reviews per day (24 hours)
// over the sliding window of the given number of days
// ending at the current time.
module.exports = function getAverageReviewsPerDay (days = 14) {
  if (!this.studyDays || this.studyDays < days) {
    const firstID = this.db.prepare(`
      select min(id) as id from revlog
    `)
    .get().id || new Date();
    const startOfDay = new Date().setHours(0, 0, 0, 0).valueOf();
    this.studyDays = 2 + Math.floor((startOfDay - firstID) / 86400000);
    days = Math.min(days, this.studyDays);
  }

  const reviews = this.db.prepare(`
    select count() as n
    from revlog
    where id > ((unixepoch() - ? * 86400) * 1000)
  `)
  .get(days).n;

  return (reviews / days);
};
