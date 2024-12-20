'use strict';

const adjustCards = require('./adjustCards.js');
const deferRelated = require('./deferRelated.js');
const formatLocalDate = require('./formatLocalDate.js');
// const getAverageNewCardsPerDay = require('./getAverageNewCardsPerDay.js');
const getCardsToReview = require('./getCardsToReview.js');
const getReviewsToNextNew = require('./getReviewsToNextNew.js');

// review is called when a card is reviewed
function review (card, viewTime, studyTime, ease) {
  const self = this;

  if (card.interval === 0) {
    self.reviewsToNextNew =
      getReviewsToNextNew.call(self);
  } else if (self.reviewsToNextNew > 0) {
    self.reviewsToNextNew = Math.min(
      self.reviewsToNextNew - 1,
      getReviewsToNextNew.call(self)
    );
    this.srf.setParam('reviewsToNextNew', this.reviewsToNextNew);
  }

  viewTime = Math.floor(viewTime);
  const newInterval = Math.max(1, getNewInterval.call(self, card, ease));
  updateSeenCard.call(self, card, viewTime, studyTime, ease, newInterval);
  deferRelated.call(self, card, now() + self.config.minTimeBetweenRelatedCards);
  if (card.interval > self.config.learningThreshold) {
    adjustCards.call(self);
  }
}

function updateSeenCard (card, viewTime, studyTime, ease, newInterval) {
  const self = this;
  const factor = newCardFactor.call(self, card, ease);
  const due = Math.floor(now() + newInterval);
  const lastInterval = getLastInterval.call(self, card.id);

  self.db.prepare(`
    update card
    set
      modified = ?,
      factor = ?,
      interval = ?,
      lastinterval = ?,
      due = ?,
      views = ?
    where id = ?
  `)
  .run(
    now(),
    factor,
    newInterval,
    newInterval,
    due,
    card.views + 1,
    card.id
  );

  self.db.prepare(`
    insert into revlog (
      id,
      revdate,
      cardid,
      ease,
      interval,
      lastinterval,
      factor,
      viewtime,
      studytime
    ) values (?,?,?,?,?,?,?,?,?)
  `)
  .run(
    Date.now(),
    formatLocalDate(new Date()),
    card.id,
    ease,
    newInterval,
    lastInterval,
    factor,
    viewTime,
    studyTime
  );
}

function getLastInterval (id) {
  const self = this;
  const result = self.db.prepare(`
    select interval
    from revlog
    where cardid = ?
    order by id desc
    limit 1
  `)
  .get(id);
  return result ? result.interval : 0;
}

// newCardFactor implements an exponentially weighted moving average of the
// ease weights to produce a factor that should correlate with the ease of
// the card. Assumptions are that some cards are harder/easier than others
// and that the ease of a card can change over time and reviews. This
// factor is used by the scheduler to calculate the new interval after Good
// and Easy reviews.
function newCardFactor (card, ease) {
  const self = this;
  const easeWeight = {
    fail: self.config.weightFail,
    hard: self.config.weightHard,
    good: self.config.weightGood,
    easy: self.config.weightEasy,
  };
  return (
    (
      self.config.decayFactor * (card.factor || 0) +
      (1.0 - self.config.decayFactor) * (easeWeight[ease])
    ) || 0
  ).toFixed(4);
}

// Returns the new interval for the card, according to ease
// There is a different algorithm for each ease.
function getNewInterval (card, ease) {
  const self = this;
  if (ease === 'fail') return intervalFail.call(self, card);
  else if (ease === 'hard') return intervalHard.call(self, card);
  else if (ease === 'good') return intervalGood.call(self, card);
  else if (ease === 'easy') return intervalEasy.call(self, card);
  else throw new Error('unsupported ease: ' + ease);
}

function getIntervals (card) {
  const self = this;
  if (!card) throw new Error('Missing required argument: card');
  return {
    fail: intervalFail.call(self, card),
    hard: intervalHard.call(self, card),
    good: intervalGood.call(self, card),
    easy: intervalEasy.call(self, card),
  };
}

function intervalFail (card) {
  const self = this;
  return (
    Math.max(
      1,
      Math.floor(
        Math.min(
          card.interval < self.config.learningThreshold
            ? self.config.failLearningMaxInterval
            : self.config.failMaxInterval,
          card.interval * self.config.failFactor
        )
      )
    )
  );
}

function intervalHard (card) {
  const self = this;
  return (
    Math.max(
      1,
      Math.floor(
        Math.min(
          card.interval < self.config.learningThreshold
            ? self.config.hardLearningMaxInterval
            : self.config.hardMaxInterval,
          card.interval * self.config.hardFactor
        )
      )
    )
  );
}

function intervalGood (card) {
  return (
    Math.floor(
      Math.min(
        this.config.maxInterval,
        this.config.maxGoodInterval,
        Math.max(
          this.config.goodMinInterval,
          getRecentInterval.call(this, card) * Math.max(
            this.config.goodMinFactor,
            this.config.goodFactor * newCardFactor.call(this, card, 'good')
          )
        )
      )
    )
  );
}

function getRecentInterval (card) {
  // New cards don't have previous reviews
  if (card.interval === 0) return 0;
  const timeSinceLastReview = getTimeSinceLastReview.call(this, card);
  let sum = timeSinceLastReview;
  let n = 1;
  // The card may have been reset. Ignore logs before interval of 0.
  const recentIntervals =
    this.db.prepare(`
      select interval
      from revlog
      where cardid = ?
      order by id desc
      limit ?
    `)
    .all(card.id, this.config.recentIntervalWindow);
  for (let i = 1; i < recentIntervals.length; i++) {
    const interval = recentIntervals[i].interval;
    if (interval === 0) break;
    sum += interval;
    n++;
  }
  return Math.floor(Math.max(timeSinceLastReview, sum / n));
}

function getTimeSinceLastReview (card) {
  const timeLastSeen = getTimeCardLastSeen.call(this, card.id);
  return timeLastSeen ? now() - timeLastSeen : 0;
}

function getTimeCardLastSeen (id) {
  const result = this.db.prepare(`
    select max(id) as id
    from revlog
    where cardid = ?
  `)
  .get(id);
  return result.id ? Math.floor(result.id / 1000) : 0;
}

function intervalEasy (card) {
  return (
    Math.floor(
      Math.min(
        this.config.maxInterval,
        this.config.maxEasyInterval,
        Math.max(
          this.config.easyMinInterval,
          (
            getRecentInterval.call(this, card) *
            this.config.easyFactor *
            newCardFactor.call(this, card, 'easy')
          )
        )
      )
    )
  );
}

// getNextDue returns the next due card to be studied.
// One of two sorting algorithms is used, selected randomly.
// One of the first 5 cards is selected at random, rather than strictly the
// first card in the selected sort.
// Normally, only due cards may be returned but if overrideLimits is true
// then cards are sorted by due date and may be returned even if their due
// date is in the future.
function getNextDue (overrideLimits = false) {
  const self = this;

  let cards;
  if (overrideLimits) {
    cards = self.db.prepare(`
      select *
      from card
      where interval > 0
      order by due, templateid
      limit 5
    `).all();
  } else if (Math.random() < self.config.probabilityOldestDue) {
    cards = self.db.prepare(`
      select *
      from card
      where interval > 0 and due < ?
      order by due, templateid
      limit 5
    `).all(now());
  } else {
    cards = self.db.prepare(`
      select *
      from card
      where interval > 0 and due < ?
      order by interval, due, templateid
      limit 5
    `).all(now());
  }
  return (cards[Math.floor(Math.random() * cards.length)]);
}

function getTimeNextDue () {
  const self = this;
  const card = self.db.prepare(`
    select *
    from card
    where interval > 0
    order by due, templateid
    limit 1
  `).get();
  if (!card) return;
  return card.due;
}

function getNextNew () {
  const self = this;

  const card = self.db.prepare(`
    select *
    from card
    where
      interval <= 0 and
      fieldsetid not in (
        select fieldsetid from card where interval > 0 and due < ?
      ) and
      fieldsetid not in (
        select card.fieldsetid from revlog join card on card.id = revlog.cardid where revlog.id > ?
      )
    order by ord, id
    limit 1
  `).get(
    now() + self.config.minTimeBetweenRelatedCards,
    (now() - self.config.minTimeBetweenRelatedCards) * 1000
  );
  return card;
}

function getNewCardMode () {
  const self = this;

  const statsPast24Hours = self.srf.getStatsPast24Hours();
  const statsNext24Hours = self.getStatsNext24Hours();
  const cardsOverdue = self.srf.getCountCardsOverdue();
  const studyTime =
    (
      (statsPast24Hours.time + statsNext24Hours.time) / 2 +
      self.srf.getAverageStudyTime()
    ) / 2;

  if (
    studyTime < self.config.targetStudyTime &&
    statsPast24Hours.newCards < self.config.maxNewCardsPerDay &&
    cardsOverdue === 0
  ) {
    if (studyTime < self.config.minStudyTime) {
      return 'go';
    } else {
      return 'slow';
    }
  } else {
    return 'stop';
  }
}

function getNextCard (overrideLimits = false) {
  const self = this;

  if (overrideLimits) return self.getNextDue(true) || self.getNextNew();

  const newCardMode = getNewCardMode.call(self);

  const dueCard = self.getNextDue();

  if (
    (newCardMode === 'go' && !dueCard) ||
    (newCardMode !== 'stop' && self.reviewsToNextNew === 0)
  ) {
    return self.getNextNew();
  } else {
    return dueCard;
  }
}

function getStatsNext24Hours () {
  const self = this;
  // Get the average time per unique card per day, averaged over the past
  // 14 days of study. This will be the estimate of time per card due. It
  // should factor in a typical balance of new cards (reviewed multiple
  // times per day) and older cards (reviewed only once per day), and the
  // average recent difficulty / study style. Exclude the current revdate
  // because it will underestimate the total study time of short interval
  // cards.
  const timePerCard =
    self.db.prepare(`
      select avg(t/n) as avg
      from (
        select
          count(distinct cardid) as n,
          sum(studytime) as t
        from revlog
        where revdate != (select max(revdate) from revlog)
        group by revdate
        order by revdate desc
        limit 14
      )
    `)
    .get().avg || 0.5;

  // Get the number of cards due, excluding those that will not be
  // presented due to minTimeBetweenRelatedCards and including average new
  // cards per day.
  const t2 = now() + 60 * 60 * 24;
  const t1 = Math.min(t2, now() + self.config.minTimeBetweenRelatedCards);
  let cards =
    self.db.prepare(`
      select count(distinct fieldsetid) as count
      from card
      where
        due < ? and
        interval > 0
    `)
    .get(t1).count;
  if (t2 > t1) {
    cards +=
      self.db.prepare(`
        select count() as count
        from card
        where
          due >= ? and
          due < ?
      `)
      .get(t1, t2).count;
  }
  // cards += getAverageNewCardsPerDay.call(this);
  return ({
    count: Math.floor(cards),
    time: Math.floor(cards * timePerCard),
    minReviews: getReviewsToNextNew.call(self),
    reviewsToNextNew: self.reviewsToNextNew,
  });
}

function getCountCardsDueToday () {
  const self = this;
  const endOfDay =
    Math.floor(new Date().setHours(23, 59, 59, 999).valueOf() / 1000);
  return (getCardsToReview.call(self, endOfDay - now()));
}

// Seconds since the epoch, right now.
function now () {
  return (Math.floor(Date.now() / 1000));
}

function defaultConfigParameters () {
  const self = this;

  const config = self.config;

  const defaults = {
    decayFactor: 0.95,
    easyFactor: 1.5,
    easyMinInterval: '1 day',
    failFactor: 0.5,
    failLearningMaxInterval: '1 day',
    failMaxInterval: '1 week',
    goodFactor: 1.0,
    goodMinFactor: 1.1,
    goodMinInterval: '2 minutes',
    hardFactor: 0.8,
    hardLearningMaxInterval: '1 week',
    hardMaxInterval: '1 month',
    learningThreshold: '1 week',
    matureThreshold: '21 days',
    maxEasyInterval: '1 year',
    maxGoodInteral: '1 year',
    maxInterval: '1 year',
    maxNewCardsPerDay: 20,
    maxViewTime: '2 minutes',
    minPercentCorrectCount: 10,
    minStudyTime: '20 minutes',
    minTimeBetweenRelatedCards: '1 hour',
    newCardRateFactor: 0.9,
    percentCorrectSensitivity: 0.0001,
    percentCorrectTarget: 90,
    percentCorrectWindow: '1 month',
    probabilityOldestDue: 0.2,
    recentIntervalWindow: 3,
    studyTimeErrorSensitivity: 1.0,
    targetStudyTime: '30 minutes',
    weightEasy: 2,
    weightFail: 0,
    weightGood: 1.5,
    weightHard: 1,
  };

  Object.keys(defaults).forEach(key => {
    if (typeof (config[key]) === 'undefined') {
      config[key] = self.srf.resolveUnits(defaults[key]);
    }
  });
}

function shutdown () {
  this.srf.setParam('reviewsToNextNew', this.reviewsToNextNew);
}

const api = {
  getCountCardsDueToday,
  getIntervals,
  getNewCardMode,
  getNextCard,
  getNextDue,
  getNextNew,
  getStatsNext24Hours,
  getTimeNextDue,
  review,
  shutdown,
};

module.exports = function (opts = {}) {
  const instance = Object.create(api);

  instance.db = opts.db;
  instance.srf = opts.srf;
  instance.config = opts.config || {};
  defaultConfigParameters.call(instance);
  instance.reviewsToNextNew =
    Math.floor(instance.srf.getParam('reviewsToNextNew') || 0);

  return instance;
};
