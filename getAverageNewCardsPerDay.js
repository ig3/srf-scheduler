'use strict';
// Returns the average number of new cards per day (24 hours)
// over a sliding window. The window begins at the later of the specified
// days ago or time of the first review and ends at current time. Thus, at
// the beginning of study, the effective window will be less than
// requested, rather than including time before study began in the average.

module.exports = function getAverageNewCardsPerDay (days = 14) {
  if (!this.firstID) {
    this.firstID = this.db.prepare(`
      select min(id) as id from revlog
    `)
    .get().id;
  }
  if (!this.firstID) return 0;

  const now = Date.now();
  const limit = Math.max(this.firstID, now - 86400000 * days);

  return this.db.prepare(`
    select count(case when lastinterval = 0 then 1 end) as n
    from revlog
    where id >= ?
  `)
  .get(limit).n * (86400000 / (now - limit));
};
