'use strict';

const formatLocalDate = require('./formatLocalDate.js');
const getPercentCorrect = require('./getPercentCorrect.js');

// review is called when a card is reviewed
function review (card, viewTime, studyTime, ease) {
  const self = this;

  self.reviewsSinceLastNewCard =
    card.interval === 0 ? 0 : self.reviewsSinceLastNewCard + 1;

  viewTime = Math.floor(viewTime);
  const newInterval = Math.max(1, getNewInterval.call(self, card, ease));
  updateSeenCard.call(self, card, viewTime, studyTime, ease, newInterval);
  deferRelated.call(self, card, now() + self.config.minTimeBetweenRelatedCards);
  if (card.interval > self.config.learningThreshold) {
    adjustCards.call(self);
  }
}

// Adjust the interval and due of cards according to the difference between
// 'percent correct' and percentCorrectTarget. Only cards with interval
// between learningThreshold and maxInterval are adjusted. The purpose of
// this is to provide a low latency feedback from error rate (percent
// correct) to interval.
function adjustCards () {
  const self = this;

  const percentCorrect = getPercentCorrect.call(self);
  if (percentCorrect) {
    const error = percentCorrect - self.config.percentCorrectTarget;
    if (Math.abs(error) > 1) {
      const adjustment = Math.max(
        -0.5,
        error * self.config.percentCorrectSensitivity
      );
      self.db.prepare(`
        update card
        set
          interval = floor(interval + interval * @adjustment),
          due = floor(due + interval * @adjustment)
        where
          due > @now and
          interval > @minInterval and
          interval < @maxInterval
      `)
      .run({
        adjustment: adjustment,
        minInterval: self.config.learningThreshold,
        maxInterval: self.config.maxInterval,
        now: now()
      });
    }
  }
}

function deferRelated (card, due) {
  const self = this;
  self.db.prepare(`
    update card
    set due = ?
    where
      fieldsetid = ? and
      id != ? and
      due < ?
  `)
  .run(
    due,
    card.fieldsetid,
    card.id,
    due
  );
}

function updateSeenCard (card, viewTime, studyTime, ease, newInterval) {
  const self = this;
  const factor = newCardFactor.call(self, card, ease);
  const due = Math.floor(now() + newInterval);
  const lastInterval = getLastInterval.call(self, card.id);
  const lapsed =
    newInterval < self.config.matureThreshold &&
    lastInterval > self.config.matureThreshold;
  const lapses = card.lapses + (lapsed ? 1 : 0);

  self.db.prepare(`
    update card
    set
      modified = ?,
      factor = ?,
      interval = ?,
      lastinterval = ?,
      due = ?,
      views = ?,
      lapses = ?
    where id = ?
  `)
  .run(
    now(),
    factor,
    newInterval,
    newInterval,
    due,
    card.views + 1,
    lapses,
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
      studytime,
      lapses
    ) values (?,?,?,?,?,?,?,?,?,?)
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
    studyTime,
    lapses
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
    eash: self.config.weightEasy
  };
  return (
    self.config.decayFactor * (card.factor || 0) +
    (1.0 - self.config.decayFactor) * (easeWeight[ease])
  ).toFixed(2);
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
  return {
    fail: intervalFail.call(self, card),
    hard: intervalHard.call(self, card),
    good: intervalGood.call(self, card),
    easy: intervalEasy.call(self, card)
  };
}

function intervalFail (card) {
  const self = this;
  return (
    Math.max(
      1,
      Math.floor(
        Math.min(
          self.config.failMaxInterval,
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
          self.config.hardMaxInterval,
          card.interval * self.config.hardFactor
        )
      )
    )
  );
}

function intervalGood (card) {
  const self = this;
  const interval = card.interval < self.config.learningThreshold
    ? card.interval
    : (card.interval + getTimeSinceLastReview.call(self, card)) / 2;
  return (
    Math.floor(
      Math.min(
        self.config.maxInterval,
        self.config.maxGoodInterval,
        Math.max(
          self.config.goodMinInterval,
          interval * self.config.goodMinFactor,
          (
            interval *
            self.config.goodFactor *
            newCardFactor.call(self, card, 'good')
          )
        )
      )
    )
  );
}

function getTimeSinceLastReview (card) {
  const self = this;
  const timeLastSeen = getTimeCardLastSeen.call(self, card.id);
  return timeLastSeen ? now() - timeLastSeen : 0;
}

function getTimeCardLastSeen (id) {
  const self = this;
  const result = self.db.prepare(`
    select max(id) as id
    from revlog
    where cardid = ?
  `)
  .get(id);
  return result.id ? Math.floor(result.id / 1000) : 0;
}

function intervalEasy (card) {
  const self = this;

  return (
    Math.floor(
      Math.min(
        self.config.maxInterval,
        self.config.maxEasyInterval,
        Math.max(
          self.config.easyMinInterval,
          intervalGood.call(self, card) * self.config.easyFactor
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
      where interval != 0
      order by due, templateid
      limit 5
    `).all();
  } else if (Math.random() < self.config.probabilityOldestDue) {
    cards = self.db.prepare(`
      select *
      from card
      where interval != 0 and due < ?
      order by due, templateid
      limit 5
    `).all(now());
  } else {
    cards = self.db.prepare(`
      select *
      from card
      where interval != 0 and due < ?
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
    where interval != 0
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
      interval = 0 and
      fieldsetid not in (
        select fieldsetid from card where interval != 0 and due < ?
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

  if (
    statsPast24Hours.time < self.config.targetStudyTime &&
    statsNext24Hours.time < self.config.targetStudyTime &&
    statsPast24Hours.newCards < self.config.maxNewCardsPerDay &&
    cardsOverdue === 0
  ) {
    if (
      statsPast24Hours.time < self.config.minStudyTime &&
      statsNext24Hours.time < self.config.minStudyTime
    ) {
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
    (newCardMode !== 'stop' && timeForNewCard.call(self))
  ) {
    return self.getNextNew();
  } else {
    return dueCard;
  }
}

function timeForNewCard () {
  const self = this;

  const minReviews = Math.floor(
    getAverageStudyTime.call(self) / self.config.targetStudyTime *
    getAverageReviewsPerDay.call(self) /
    (getAverageNewCardsPerDay.call(self) || self.config.maxNewCardsPerDay)
  );

  return self.reviewsSinceLastNewCard > minReviews;
}

function getAverageStudyTime (days = 14) {
  const self = this;
  return self.db.prepare(`
    select avg(n) as avg
    from (
      select sum(studytime) as n
      from revlog
      where revdate != (select max(revdate) from revlog)
      group by revdate
      order by revdate desc
      limit ?
    )
  `)
  .get(days).avg || 0;
}

function getAverageReviewsPerDay (days = 14) {
  const self = this;
  return self.db.prepare(`
    select avg(n) as avg
    from (
      select count() as n
      from revlog
      where revdate != (select max(revdate) from revlog)
      group by revdate
      order by revdate desc
      limit ?
    )
  `)
  .get(days).avg || 0;
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
        interval != 0
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
  cards += getAverageNewCardsPerDay.call(this);
  return ({
    count: Math.floor(cards),
    time: Math.floor(cards * timePerCard)
  });
}

function getAverageNewCardsPerDay (days = 14) {
  const self = this;

  // Exclude the current date because it will be incomplete so will
  // underestimate the number of new cards for the full day.
  return self.db.prepare(`
    select avg(n) as avg
    from (
      select count(case when lastinterval = 0 then 1 end) as n
      from revlog
      where revdate != (select max(revdate) from revlog)
      group by revdate
      order by revdate desc
      limit ?
    )
  `)
  .get(days).avg || 0;
}

function getCardsToReview (secs) {
  const self = this;
  const limit = Math.min(secs, self.config.minTimeBetweenRelatedCards);
  let cardsDue =
    self.db.prepare(`
      select count(distinct fieldsetid) as count
      from card
      where
        interval != 0 and
        due < ?
    `)
    .get(now() + limit).count;
  if (secs > limit) {
    cardsDue +=
      self.db.prepare(`
        select count() as count
        from card
        where
          interval != 0 and
          due > ? and
          due < ?
      `)
      .get(now() + limit, now() + secs).count;
  }
  return cardsDue;
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
    failMaxInterval: '1 day',
    goodFactor: 1.0,
    goodMinFactor: 1.1,
    goodMinInterval: '5 minutes',
    hardFactor: 0.8,
    hardMaxInterval: '1 week',
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
    percentCorrectSensitivity: 0.0001,
    percentCorrectTarget: 90,
    percentCorrectWindow: '1 month',
    probabilityOldestDue: 0.2,
    targetStudyTime: '30 minutes',
    weightEasy: 2,
    weightFail: 0,
    weightGood: 1.5,
    weightHard: 1
  };

  Object.keys(defaults).forEach(key => {
    if (typeof (config[key]) === 'undefined') {
      config[key] = self.srf.resolveUnits(defaults[key]);
    }
  });
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
  review
};

module.exports = function (opts = {}) {
  const instance = Object.create(api);

  instance.db = opts.db;
  instance.srf = opts.srf;
  instance.config = opts.config;
  instance.reviewsSinceLastNewCard = 0;

  if (instance.config) {
    defaultConfigParameters.call(instance);
  }

  return instance;
};
