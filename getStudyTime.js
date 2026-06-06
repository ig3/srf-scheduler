'use strict';
// Returns study time (seconds) in the specified number of hours past.
module.exports = function getStudyTime (hours = 24) {
  const studyTime = this.db.prepare(`
    select sum(studytime) as n
    from revlog
    where id > ((unixepoch() - ? * 3600) * 1000)
  `)
  .get(hours).n || 0;

  return studyTime;
};
