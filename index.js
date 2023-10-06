'use strict';

// review is called when a card is reviewed
function review (card, viewTime, studyTime, ease) {
  const self = this;

  self.reviewsSinceLastNewCard =
    card.interval === 0 ? 0 : self.reviewsSinceLastNewCard + 1;

  if (viewTime > self.config.maxViewTime) {
    studyTime = viewTime = 120;
    ease = 'fail';
  }

  viewTime = Math.floor(viewTime);
  const newInterval = Math.max(1, getNewInterval.call(self, card, ease));
  updateSeenCard.call(self, card, viewTime, studyTime, ease, newInterval);
  deferRelated.call(self, card, now() + self.config.minTimeBetweenRelatedCards);
  if (card.interval > self.config.learningThreshold) {
    adjustCards.call(self);
  }
}

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

function getPercentCorrect (on, window, minInterval, maxInterval) {
  const self = this;
  on ||= now();
  window ||= self.config.percentCorrectWindow;
  minInterval ||= self.config.matureThreshold;
  maxInterval ||= self.config.maxInterval;

  const result = self.db.prepare(`
    select
      count() as count,
      avg(
        case ease
        when 'fail' then 0
        else 1
        end
      ) as average
    from revlog
    where
      lastinterval > @minInterval and
      lastinterval < @maxInterval and
      id > @from and
      id < @to
  `)
  .get({
    minInterval: minInterval,
    maxInterval: maxInterval,
    from: (on - window) * 1000,
    to: on * 1000
  });
  return (
    (result && result.count > self.config.minPercentCorrectCount)
      ? result.average * 100
      : 0
  );
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

function formatLocalDate (date) {
  const format = (n) => (n < 10 ? '0' : '') + n;
  return date.getFullYear() +
    '-' + format(date.getMonth() + 1) +
    '-' + format(date.getDate());
}

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
  return result ? Math.floor(result.id / 1000) : 0;
}

function intervalEasy (card) {
  const self = this;

  return (
    Math.floor(
      self.config.maxInterval,
      self.config.maxEasyInterval,
      Math.max(
        self.config.easyMinInterval,
        intervalGood.call(self, card) * self.config.easyFactor
      )
    )
  );
}

// getNext returns the ID of the next card to be reviewed.
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
    (now() - self.config.mintimeBetweenRelatedCards) * 1000
  );
  return card;
}

function getNextCard (overrideLimits = false) {
  const self = this;

  if (overrideLimits) return self.getNextDue() || self.getNextNew();

  const statsPast24Hours = self.srf.getStatsPast24Hours();
  const statsNext24Hours = self.srf.getStatsNext24Hours();
  const cardsOverdue = self.srf.getCountCardsOverdue();
  const minReviewsPerNewCard =
    statsPast24Hours.count / self.config.maxNewCardsPerDay / 2;

  const dueCard = self.getNextDue();
  if (
    statsPast24Hours.time < self.config.targetStudyTime &&
    statsNext24Hours.time < self.config.targetStudyTime &&
    statsPast24Hours.newCards < self.config.maxNewCardsPerDay &&
    cardsOverdue === 0 && (
      self.reviewsSinceLastNewCard > minReviewsPerNewCard ||
      (!dueCard && statsPast24Hours.time < self.config.minStudyTime)
    )
  ) {
    return self.getNextNew();
  } else {
    return self.getNextDue();
  }
}

function getStatsNext24Hours () {
  const self = this;
  const countCards = getCardsToReview.call(self, 60 * 60 * 24);
  const countNewCards = getNewCardsToReview.call(self, 60 * 60 * 24);
  const countOldCards = countCards - countNewCards;
  return ({
    count: countCards,
    time:
      countOldCards * getAverageStudyTimePerOldCard.call(self) +
      countNewCards * getAverageStudyTimePerNewCard.call(self)
  });
}

function getAverageStudyTimePerOldCard (days = 14) {
  const self = this;
  let stats =
    self.db.prepare(`
      select sum(studytime) / count(distinct cardid) as average
      from revlog
      where
        interval < 68400 and
        id > ?
      group by revdate
    `)
    .all((now() - days * 60 * 60 * 24) * 1000);
  if (stats && stats.length > 0) {
    let total = 0;
    stats.forEach(day => {
      total += day.average;
    });
    return total / stats.length;
  }

  stats =
    self.db.prepare(`
      select sum(studytime) / count(distinct cardid) as average
      from revlog
      where interval < 68400
      group by revdate
    `)
    .all();

  if (stats && stats.length > 0) {
    let total = 0;
    stats.forEach(day => {
      total += day.average;
    });
    return total / stats.length;
  }

  return 30;
}

function getAverageStudyTimePerNewCard (days = 14) {
  const self = this;
  let stats =
    self.db.prepare(`
      select sum(studytime) / count(distinct cardid) as average
      from revlog
      where
        interval < 68400 and
        id > ?
      group by revdate
    `)
    .all((now() - days * 60 * 60 * 24) * 1000);

  if (stats && stats.length > 0) {
    let total = 0;
    stats.forEach(day => {
      total += day.average;
    });
    return total / stats.length;
  }

  stats =
    self.db.prepare(`
      select sum(studytime) / count(distinct cardid) as average
      from revlog
      where interval < 68400
      group by revdate
    `)
    .all();

  if (stats && stats.length > 0) {
    let total = 0;
    stats.forEach(day => {
      total += day.average;
    });
    return total / stats.length;
  }

  return 30;
}

function getNewCardsToReview (secs) {
  const self = this;
  const limit = Math.min(secs, self.config.minTimeBetweenRelatedCards);
  let cardsDue =
    self.db.prepare(`
      select count(distinct fieldsetid) as count
      from card
      where
        interval != 0 and
        interval < 68400 and
        due <= ?
    `)
    .get(now() + limit).count;
  if (secs > limit) {
    cardsDue +=
      self.db.prepare(`
        select count() as count
        from card
        where
          interval != 0 and
          interval < 68400 and
          due > ? and
          due < ?
      `)
      .get(now() + limit, now() + secs).count;
  }
  return cardsDue;
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

const api = {
  getCountCardsDueToday,
  getIntervals,
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

  return instance;
};
