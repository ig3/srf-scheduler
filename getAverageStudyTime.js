'use strict';
const formatLocalDate = require('./formatLocalDate');

module.exports = function getAverageStudyTime (days = 7) {
  const hist = this.db.prepare(`
    select revdate, sum(studytime) as n
    from revlog
    group by revdate
    order by revdate desc
    limit ?
  `)
  .all(days + 1);
  if (hist.length === 0) return 0;
  if (
    hist.length > 1 &&
    hist[0].revdate === formatLocalDate(new Date())
  ) {
    hist.shift();
  }
  let sum = 0;
  hist.forEach(record => {
    sum += record.n;
  });
  return (sum / hist.length);
};
