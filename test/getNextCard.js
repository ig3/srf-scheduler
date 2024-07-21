'use strict';

const t = require('@ig3/test');

t.test('getNextCard', t => {
  t.test('overrideLimits with no cards', t => {
    const setup = setup1();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const card = scheduler.getNextCard(true);
    t.ok(!card, 'no card available');
    t.end();
  });

  t.test('overrideLimits with card due now', t => {
    const setup = setup3();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const card = scheduler.getNextCard(true);
    t.ok(card, 'got a card');
    t.ok(card.due < now(), 'card is already due');
    t.ok(card.interval !== 0, 'card interval is not zero');
    t.ok(card.id === 1, 'got card 1');
    t.end();
  });

  t.test('overrideLimits with card due in the future', t => {
    const setup = setup4();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const card = scheduler.getNextCard(true);
    t.ok(card, 'got a card');
    t.ok(card, 'got a card');
    t.ok(card.due > now(), 'card is already due');
    t.ok(card.interval !== 0, 'card interval is not zero');
    t.ok(card.id === 1, 'got card 1');
    t.end();
  });

  t.test('overrideLimits with no card due', t => {
    const setup = setup2();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const card = scheduler.getNextCard(true);
    t.ok(card, 'got a card');
    t.ok(card.due === 0, 'card is new / not due');
    t.ok(card.interval === 0, 'card interval is zero');
    t.ok(card.id === 1, 'got card 1');
    t.end();
  });

  t.test('No cards', t => {
    const setup = setup1();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const card = scheduler.getNextCard();
    t.ok(!card, 'no card');
    t.end();
  });

  t.test('First review', t => {
    const setup = setup2();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const card = scheduler.getNextCard();
    t.ok(card, 'got a card');
    t.equal(card.id, 1, 'card ID 1');
    t.equal(card.due, 0, 'new card - not due');
    t.equal(card.interval, 0, 'new card - no interval');
    t.end();
  });

  t.test('Second review', t => {
    const setup = setup4();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const card = scheduler.getNextCard();
    t.ok(card, 'got a card');
    // Card 2 is skipped because it is related to card 1, recently reviewed
    t.equal(card.id, 3, 'card ID 3');
    t.equal(card.due, 0, 'new card - not due');
    t.equal(card.interval, 0, 'new card - no interval');
    t.end();
  });

  t.test('Past config.minStudyTime and no cards since last new card', t => {
    const setup = setup5();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const card = scheduler.getNextCard();
    t.ok(!card, 'no card');
    t.end();
  });

  t.test('Past config.minStudyTime and many cards since last new card', t => {
    const setup = setup5();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    scheduler.reviewsToNextNew = 0;

    const card = scheduler.getNextCard();
    t.ok(card, 'got a  card');
    t.equal(card.id, 33, 'card ID 33');
    t.equal(card.due, 0, 'new card - not due');
    t.equal(card.interval, 0, 'new card - no interval');
    t.end();
  });
  t.end();
});

function formatLocalDate (date) {
  const format = (n) => (n < 10 ? '0' : '') + n;
  return date.getFullYear() +
    '-' + format(date.getMonth() + 1) +
    '-' + format(date.getDate());
}

function dateDaysAgo (n) {
  const d = new Date();

  d.setDate(d.getDate() - n);

  return formatLocalDate(d);
}

function resolveUnits (value) {
  if (typeof value === 'string') {
    const match = value.match(/^([0-9]+)\s*(.*)/);
    if (match) {
      const number = Number(match[1] || 0);
      const units = match[2].toLowerCase();
      if (units) {
        const multiplier = getMultiplier(units);
        if (!multiplier) throw new Error('Unsupported unit: ' + units);
        return number * multiplier;
      }
    }
  }
  return value;
}

function getMultiplier (unit) {
  const units = [
    ['seconds', 1],
    ['minutes', 60],
    ['hours', 3600],
    ['days', 3600 * 24],
    ['weeks', 3600 * 24 * 7],
    ['months', 3600 * 24 * 365 / 12],
    ['years', 3600 * 24 * 365],
  ];
  for (let i = 0; i < units.length; i++) {
    if (units[i][0].startsWith(unit)) return units[i][1];
  }
  throw new Error('Unsupported unit: ', unit);
}

// Return seconds since the epoch
function now () {
  return Math.floor(Date.now() / 1000);
}

// Empty DB - no new cards and no due cards and no review logs

function setup1 () {
  const db = require('better-sqlite3')();
  db.prepare(`
    create table card (
      id integer primary key,
      fieldsetid integer not null,
      templateid integer not null,
      modified integer not null,
      interval integer not null,
      lastinterval integer not null,
      due integer not null,
      factor integer not null,
      views integer not null,
      lapses integer not null,
      ord integer not null
    )
  `).run();

  db.prepare(`
    create table revlog (
      id integer primary key,
      revdate text not null,
      cardid integar not null,
      ease text not null,
      interval integer not null,
      lastinterval integer not null,
      factor real not null,
      viewtime integer not null,
      studytime integer not null,
      lapses integer not null
    )
  `).run();
  const srf = {
    getStatsNext24Hours: function () {
      return {
        cards: 0,
        time: 0,
      };
    },
    getStatsPast24Hours: function () {
      return {
        count: 0,
        time: 0,
        newCards: 0,
      };
    },
    getCountCardsOverdue: function () {
      return 0;
    },
    getAverageStudyTime: function () {
      return 1800;
    },
    resolveUnits: resolveUnits,
    getParam: function (name) {
      if (name === 'reviewsToNextNew') return 7;
      if (name === 'reviewsPerNewCard') return 14;
      throw new Error('Unsupported param: ' + name);
    },
  };

  const config = {
    decayFactor: 0.95,
    failFactor: 0.5,
    failMaxInterval: 60 * 60,
    goodFactor: 1.1,
    goodMinFactor: 1.1,
    goodMinInterval: 60 * 5,
    hardMaxInterval: 60 * 60 * 24,
    learningThreshold: 60 * 60 * 24 * 7,
    matureThreshold: 60 * 60 * 24 * 21,
    maxGoodInterval: 60 * 60 * 24 * 365,
    maxInterval: 60 * 60 * 24 * 365,
    maxNewCardsPerDay: 20,
    maxViewTime: 60 * 2,
    minPercentCorrectCount: 2,
    minStudyTime: 1200,
    percentCorrectSensitivity: 0.01,
    percentCorrectTarget: 90,
    percentCorrectWindow: 60 * 60 * 24 * 30,
    probabilityOldestDue: 0.5,
    targetStudyTime: 3600,
    weightEasy: 2,
    weightFail: 0,
    weightGood: 1.5,
    weightHard: 1,
    hardFactor: 0.8,
    newCardRateFactor: 0.8,
  };

  return {
    db: db,
    srf: srf,
    config: config,
  };
}

// New DB
//  new cards
//  no due cards
//  no review logs

function setup2 () {
  const db = require('better-sqlite3')();
  db.prepare(`
    create table card (
      id integer primary key,
      fieldsetid integer not null,
      templateid integer not null,
      modified integer not null,
      interval integer not null,
      lastinterval integer not null,
      due integer not null,
      factor integer not null,
      views integer not null,
      lapses integer not null,
      ord integer not null
    )
  `).run();

  db.prepare(`
    insert into card (
      fieldsetid,
      templateid,
      modified,
      interval,
      lastinterval,
      due,
      factor,
      views,
      lapses,
      ord
    ) values
      ( 1, 1, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0),
      ( 1, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0),
      ( 2, 1, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0),
      ( 2, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0)
  `).run();

  db.prepare(`
    create table revlog (
      id integer primary key,
      revdate text not null,
      cardid integar not null,
      ease text not null,
      interval integer not null,
      lastinterval integer not null,
      factor real not null,
      viewtime integer not null,
      studytime integer not null,
      lapses integer not null
    )
  `).run();
  const srf = {
    getStatsNext24Hours: function () {
      return {
        cards: 0,
        time: 0,
      };
    },
    getStatsPast24Hours: function () {
      return {
        count: 0,
        time: 0,
        newCards: 0,
      };
    },
    getCountCardsOverdue: function () {
      return 0;
    },
    getAverageStudyTime: function () {
      return 1800;
    },
    resolveUnits: resolveUnits,
    getParam: function (name) {
      if (name === 'reviewsToNextNew') return 7;
      if (name === 'reviewsPerNewCard') return 14;
      throw new Error('Unsupported param: ' + name);
    },
  };

  const config = {
    decayFactor: 0.95,
    failFactor: 0.5,
    failMaxInterval: 60 * 60,
    goodFactor: 1.1,
    goodMinFactor: 1.1,
    goodMinInterval: 60 * 5,
    hardMaxInterval: 60 * 60 * 24,
    learningThreshold: 60 * 60 * 24 * 7,
    matureThreshold: 60 * 60 * 24 * 21,
    maxGoodInterval: 60 * 60 * 24 * 365,
    maxInterval: 60 * 60 * 24 * 365,
    maxNewCardsPerDay: 20,
    maxViewTime: 60 * 2,
    minPercentCorrectCount: 2,
    minStudyTime: 1200,
    percentCorrectSensitivity: 0.01,
    percentCorrectTarget: 90,
    percentCorrectWindow: 60 * 60 * 24 * 30,
    probabilityOldestDue: 0.5,
    targetStudyTime: 3600,
    weightEasy: 2,
    weightFail: 0,
    weightGood: 1.5,
    weightHard: 1,
    hardFactor: 0.8,
    newCardRateFactor: 0.8,
  };

  return {
    db: db,
    srf: srf,
    config: config,
  };
}

//  new cards available
//  One card due now
//  Study time past 24 hours < config.minStudyTime
//  Study time next 24 hours < conig.targetStudyTime
//  New cards past 24 hours < config.maxNewCardsPerDay
function setup3 () {
  const db = require('better-sqlite3')();
  db.prepare(`
    create table card (
      id integer primary key,
      fieldsetid integer not null,
      templateid integer not null,
      modified integer not null,
      interval integer not null,
      lastinterval integer not null,
      due integer not null,
      factor integer not null,
      views integer not null,
      lapses integer not null,
      ord integer not null
    )
  `).run();

  db.prepare(`
    insert into card (
      fieldsetid,
      templateid,
      modified,
      interval,
      lastinterval,
      due,
      factor,
      views,
      lapses,
      ord
    ) values
      ( 1, 1, UNIXEPOCH()-10, 5, 0, UNIXEPOCH()-5, 2, 0, 0, 0),
      ( 1, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0),
      ( 2, 1, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0),
      ( 2, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0)
  `).run();

  db.prepare(`
    create table revlog (
      id integer primary key,
      revdate text not null,
      cardid integar not null,
      ease text not null,
      interval integer not null,
      lastinterval integer not null,
      factor real not null,
      viewtime integer not null,
      studytime integer not null,
      lapses integer not null
    )
  `).run();

  db.prepare(`
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
    ) values
      (@ts - 60000, @date, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0)
  `).run({
    ts: Date.now(),
    date: dateDaysAgo(0),
  });
  const srf = {
    getStatsPast24Hours: function () {
      return {
        count: 1,
        time: 10,
        newCards: 1,
      };
    },
    getStatsNext24Hours: function () {
      return {
        cards: 1,
        time: 30,
      };
    },
    getCountCardsOverdue: function () {
      return 0;
    },
    resolveUnits: resolveUnits,
    getParam: function (name) {
      if (name === 'reviewsToNextNew') return 7;
      if (name === 'reviewsPerNewCard') return 14;
      throw new Error('Unsupported param: ' + name);
    },
  };

  const config = {
    decayFactor: 0.95,
    failFactor: 0.5,
    failMaxInterval: 60 * 60,
    goodFactor: 1.1,
    goodMinFactor: 1.1,
    goodMinInterval: 60 * 5,
    hardMaxInterval: 60 * 60 * 24,
    learningThreshold: 60 * 60 * 24 * 7,
    matureThreshold: 60 * 60 * 24 * 21,
    maxGoodInterval: 60 * 60 * 24 * 365,
    maxInterval: 60 * 60 * 24 * 365,
    maxNewCardsPerDay: 20,
    maxViewTime: 60 * 2,
    minPercentCorrectCount: 2,
    minStudyTime: 1200,
    percentCorrectSensitivity: 0.01,
    percentCorrectTarget: 90,
    percentCorrectWindow: 60 * 60 * 24 * 30,
    probabilityOldestDue: 0.5,
    targetStudyTime: 3600,
    weightEasy: 2,
    weightFail: 0,
    weightGood: 1.5,
    weightHard: 1,
    hardFactor: 0.8,
    newCardRateFactor: 0.8,
  };

  return {
    db: db,
    srf: srf,
    config: config,
  };
}

//  new cards available
//  One card due in the future
//  Study time past 24 hours < config.minStudyTime
//  Study time next 24 hours < conig.targetStudyTime
//  New cards past 24 hours < config.maxNewCardsPerDay
function setup4 () {
  const db = require('better-sqlite3')();
  db.prepare(`
    create table card (
      id integer primary key,
      fieldsetid integer not null,
      templateid integer not null,
      modified integer not null,
      interval integer not null,
      lastinterval integer not null,
      due integer not null,
      factor integer not null,
      views integer not null,
      lapses integer not null,
      ord integer not null
    )
  `).run();

  db.prepare(`
    insert into card (
      fieldsetid,
      templateid,
      modified,
      interval,
      lastinterval,
      due,
      factor,
      views,
      lapses,
      ord
    ) values
      ( 1, 1, UNIXEPOCH()-10, 5, 0, UNIXEPOCH()+5, 2, 0, 0, 0),
      ( 1, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0),
      ( 2, 1, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0),
      ( 2, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0)
  `).run();

  db.prepare(`
    create table revlog (
      id integer primary key,
      revdate text not null,
      cardid integar not null,
      ease text not null,
      interval integer not null,
      lastinterval integer not null,
      factor real not null,
      viewtime integer not null,
      studytime integer not null,
      lapses integer not null
    )
  `).run();

  db.prepare(`
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
    ) values
      (@ts - 60000, @date, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0)
  `).run({
    ts: Date.now(),
    date: dateDaysAgo(0),
  });
  const srf = {
    getStatsPast24Hours: function () {
      return {
        count: 1,
        time: 10,
        newCards: 1,
      };
    },
    getStatsNext24Hours: function () {
      return {
        cards: 1,
        time: 30,
      };
    },
    getCountCardsOverdue: function () {
      return 0;
    },
    getAverageStudyTime: function () {
      return 1800;
    },
    resolveUnits: resolveUnits,
    getParam: function (name) {
      if (name === 'reviewsToNextNew') return 7;
      if (name === 'reviewsPerNewCard') return 14;
      throw new Error('Unsupported param: ' + name);
    },
  };

  const config = {
    decayFactor: 0.95,
    failFactor: 0.5,
    failMaxInterval: 60 * 60,
    goodFactor: 1.1,
    goodMinFactor: 1.1,
    goodMinInterval: 60 * 5,
    hardMaxInterval: 60 * 60 * 24,
    learningThreshold: 60 * 60 * 24 * 7,
    matureThreshold: 60 * 60 * 24 * 21,
    maxGoodInterval: 60 * 60 * 24 * 365,
    maxInterval: 60 * 60 * 24 * 365,
    maxNewCardsPerDay: 20,
    maxViewTime: 60 * 2,
    minPercentCorrectCount: 2,
    minStudyTime: 1200,
    percentCorrectSensitivity: 0.01,
    percentCorrectTarget: 90,
    percentCorrectWindow: 60 * 60 * 24 * 30,
    probabilityOldestDue: 0.5,
    targetStudyTime: 3600,
    weightEasy: 2,
    weightFail: 0,
    weightGood: 1.5,
    weightHard: 1,
    hardFactor: 0.8,
    newCardRateFactor: 0.8,
  };

  return {
    db: db,
    srf: srf,
    config: config,
  };
}

//  new cards available
//  One card due in the future
//  Study time past 24 hours > config.minStudyTime
//  Study time past 24 hours < config.targetStudyTime
//  Study time next 24 hours < conig.targetStudyTime
//  New cards past 24 hours < config.maxNewCardsPerDay
function setup5 () {
  const db = require('better-sqlite3')();
  db.prepare(`
    create table card (
      id integer primary key,
      fieldsetid integer not null,
      templateid integer not null,
      modified integer not null,
      interval integer not null,
      lastinterval integer not null,
      due integer not null,
      factor integer not null,
      views integer not null,
      lapses integer not null,
      ord integer not null
    )
  `).run();

  db.prepare(`
    insert into card (
      fieldsetid,
      templateid,
      modified,
      interval,
      lastinterval,
      due,
      factor,
      views,
      lapses,
      ord
    ) values
      ( 1, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 1, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 2, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 2, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 3, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 3, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 4, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 4, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 5, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 5, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 6, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 6, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 7, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 7, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 8, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 8, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 9, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 9, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 10, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 10, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 11, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 11, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 12, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 12, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 13, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 13, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 14, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 14, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 15, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 15, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 16, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 16, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 17, 1, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0),
      ( 17, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0)
  `).run();

  db.prepare(`
    create table revlog (
      id integer primary key,
      revdate text not null,
      cardid integar not null,
      ease text not null,
      interval integer not null,
      lastinterval integer not null,
      factor real not null,
      viewtime integer not null,
      studytime integer not null,
      lapses integer not null
    )
  `).run();

  const date = new Date();
  const d3 = formatLocalDate(date);
  date.setDate(date.getDate() - 1);
  const d2 = formatLocalDate(date);
  date.setDate(date.getDate() - 1);
  const d1 = formatLocalDate(date);

  db.prepare(`
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
    ) values
      (@ts - 5010, @d1, 1, 'good', 60 * 5, 0, 1.8, 10, 30, 0),
      (@ts - 5009, @d1, 9, 'good', 60 * 5, 30, 1.8, 10, 30, 0),
      (@ts - 5008, @d1, 8, 'good', 60 * 5, 0, 1.8, 10, 30, 0),
      (@ts - 5007, @d1, 7, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 5006, @d1, 6, 'good', 60 * 5, 30, 1.8, 10, 30, 0),
      (@ts - 5005, @d1, 5, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 5004, @d1, 4, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 5003, @d1, 3, 'good', 60 * 5, 30, 1.8, 10, 30, 0),
      (@ts - 5002, @d1, 2, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 5001, @d1, 1, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 5000, @d1, 1, 'good', 60 * 5, 30, 1.8, 10, 30, 0),
      (@ts - 4999, @d1, 9, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 4998, @d1, 8, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 4997, @d1, 7, 'good', 60 * 5, 30, 1.8, 10, 30, 0),
      (@ts - 4996, @d1, 6, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 4995, @d1, 5, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 4994, @d1, 4, 'good', 60 * 5, 30, 1.8, 10, 30, 0),
      (@ts - 4993, @d1, 3, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 4992, @d1, 2, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 4991, @d1, 1, 'good', 60 * 5, 30, 1.8, 10, 30, 0),
      (@ts - 4990, @d1, 1, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 4989, @d1, 9, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 4988, @d1, 8, 'good', 60 * 5, 30, 1.8, 10, 30, 0),
      (@ts - 4987, @d1, 7, 'good', 60 * 5, 60, 1.8, 10, 30, 0),

      (@ts - 3999, @d2, 9, 'good', 60 * 5, 0, 1.8, 10, 30, 0),
      (@ts - 3998, @d2, 8, 'good', 60 * 5, 500, 1.8, 10, 30, 0),
      (@ts - 3997, @d2, 7, 'good', 60 * 5, 0, 1.8, 10, 30, 0),
      (@ts - 3996, @d2, 6, 'good', 60 * 5, 1000000, 1.8, 10, 30, 0),
      (@ts - 3995, @d2, 5, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3994, @d2, 4, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3993, @d2, 3, 'good', 60 * 5, 500, 1.8, 10, 30, 0),
      (@ts - 3992, @d2, 2, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3991, @d2, 1, 'good', 60 * 5, 1000000, 1.8, 10, 30, 0),
      (@ts - 3990, @d2, 1, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3989, @d2, 9, 'good', 60 * 5, 500, 1.8, 10, 30, 0),
      (@ts - 3988, @d2, 8, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3987, @d2, 7, 'good', 60 * 5, 1000000, 1.8, 10, 30, 0),
      (@ts - 3986, @d2, 6, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3985, @d2, 5, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3984, @d2, 4, 'good', 60 * 5, 500, 1.8, 10, 30, 0),
      (@ts - 3983, @d2, 3, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3982, @d2, 2, 'good', 60 * 5, 1000000, 1.8, 10, 30, 0),
      (@ts - 3981, @d2, 1, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3980, @d2, 1, 'good', 60 * 5, 500, 1.8, 10, 30, 0),
      (@ts - 3979, @d2, 9, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3978, @d2, 8, 'good', 60 * 5, 1000000, 1.8, 10, 30, 0),
      (@ts - 3977, @d2, 7, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3976, @d2, 6, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3975, @d2, 5, 'good', 60 * 5, 500, 1.8, 10, 30, 0),
      (@ts - 3974, @d2, 4, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3973, @d2, 3, 'good', 60 * 5, 1000000, 1.8, 10, 30, 0),
      (@ts - 3972, @d2, 2, 'good', 60 * 5, 500, 1.8, 10, 30, 0),
      (@ts - 3971, @d2, 1, 'good', 60 * 5, 60, 1.8, 10, 30, 0),
      (@ts - 3970, @d2, 1, 'good', 60 * 5, 1000000, 1.8, 10, 30, 0),

      (@ts - 2989, @d3, 1, 'good', 60 * 5, 0, 1.8, 10, 30, 0)

  `).run({
    ts: Date.now(),
    d1: d1,
    d2: d2,
    d3: d3,
  });
  const srf = {
    getStatsPast24Hours: function () {
      return {
        count: 20,
        time: 2800,
        newCards: 10,
      };
    },
    getCountCardsOverdue: function () {
      return 0;
    },
    getAverageStudyTime: function () {
      return 1800;
    },
    resolveUnits: resolveUnits,
    getParam: function (name) {
      if (name === 'reviewsToNextNew') return 7;
      if (name === 'reviewsPerNewCard') return 14;
      throw new Error('Unsupported param: ' + name);
    },
  };

  const config = {
    decayFactor: 0.95,
    failFactor: 0.5,
    failMaxInterval: 60 * 60,
    goodFactor: 1.1,
    goodMinFactor: 1.1,
    goodMinInterval: 60 * 5,
    hardMaxInterval: 60 * 60 * 24,
    learningThreshold: 60 * 60 * 24 * 7,
    matureThreshold: 60 * 60 * 24 * 21,
    maxGoodInterval: 60 * 60 * 24 * 365,
    maxInterval: 60 * 60 * 24 * 365,
    maxNewCardsPerDay: 20,
    maxViewTime: 60 * 2,
    minPercentCorrectCount: 2,
    minStudyTime: 1200,
    percentCorrectSensitivity: 0.01,
    percentCorrectTarget: 90,
    percentCorrectWindow: 60 * 60 * 24 * 30,
    probabilityOldestDue: 0.5,
    targetStudyTime: 3600,
    weightEasy: 2,
    weightFail: 0,
    weightGood: 1.5,
    weightHard: 1,
    hardFactor: 0.8,
    newCardRateFactor: 0.8,
  };

  return {
    db: db,
    srf: srf,
    config: config,
  };
}
