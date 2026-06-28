'use strict';
// Returns the average study time per day (24 hours)
// over a sliding window. The window begins at the later of the specified
// days ago or time of the first review and ends at current time. Thus, at
// the beginning of study, the effective window will be less than
// requested, rather than including time before study began in the average.
module.exports = function getAverageStudyTimePerDay (days = 7) {
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
    select
      sum(studytime) as time
    from revlog
    where id >= ?
  `)
  .get(limit).time * Math.min(1, (86400000 / (now - limit)));
};
