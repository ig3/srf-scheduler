'use strict';
// Returns the average number of new cards per day (24 hours)
// over the sliding window of the given number of days.
module.exports = function getAverageNewCardsPerDay (days = 14) {
  const data = this.db.prepare(`
    select count(case when lastinterval = 0 then 1 end) as n
    from revlog
    group by revdate
    order by revdate desc
    limit ?
  `)
  .all(days + 1);
  if (data.length === 0) return 0;
  if (data.length > 1) data.shift();
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].n;
  }
  return sum / data.length;
};
