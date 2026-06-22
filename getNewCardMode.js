'use strict';

module.exports = function getNewCardMode () {
  const self = this;

  const studyTimePast24Hours = self.getStudyTime(24);
  const studyTimeNext24Hours = self.getStatsNext24Hours().time;
  const averageStudyTime = self.getAverageStudyTimePerDay();
  const studyTime =
    (
      (studyTimePast24Hours + studyTimeNext24Hours) / 2 + averageStudyTime
    ) / 2;
  const newCardsToday = self.getCountNewCardsToday();
  const cardsOverdue = self.srf.getCountCardsOverdue();

  if (
    studyTime < self.config.studyTimeTarget &&
    studyTimeNext24Hours < self.config.studyTimeLimit &&
    newCardsToday < self.config.maxNewCardsPerDay &&
    cardsOverdue === 0
  ) {
    if (
      studyTime < self.config.goModeThreshold ||
      studyTimeNext24Hours < self.config.goModeThreshold
    ) {
      return 'go';
    } else {
      return 'slow';
    }
  } else {
    return 'stop';
  }
};
