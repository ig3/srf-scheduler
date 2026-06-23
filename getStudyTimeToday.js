'use strict';
// Returns study time (seconds) since start of calendar day
module.exports = function getStudyTime () {
  const startOfDay =
    Math.floor(new Date().setHours(0, 0, 0, 0).valueOf() / 1000);

  return (
    this.db.prepare('select sum(studytime) as time from revlog where id >=?')
    .get(startOfDay * 1000)['time'] || 0
  );
};
