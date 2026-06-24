'use strict';
// Returns the exponentially weighted moving average of study time
// as seconds per day.
module.exports = function getAverageStudyTimePerDay (days = 14) {
  if (!this.days || this.days < days) {
    const firstID = this.db.prepare(`
      select min(id) as id from revlog
    `)
    .get().id || new Date();
    this.days = Math.max(1, Math.floor((new Date() - firstID) / 86400000));
    days = Math.min(days, this.days);
  }

  const series = this.db.prepare(`
    select
      sum(studytime) as time,
      cast((unixepoch() - id/1000)/86400 as integer) as day
    from revlog
    where day < ?
    group by day
    order by day
  `)
  .all(days);

  // There may be days without study: build an array indexed by days ago
  const times = [];
  series.forEach(record => {
    times[record.day] = record.time;
  });

  let avg = times[days - 1] || 0;
  const alpha = 2 / (days + 1);
  for (let n = days - 2; n >= 0; n--) {
    avg = alpha * (times[n] || 0) + (1 - alpha) * avg;
  }
  return Math.floor(avg);
};
