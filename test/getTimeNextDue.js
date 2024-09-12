'use strict';

const t = require('@ig3/test');

t.test('getTimeNextDue', t => {
  t.test('No cards', t => {
    const setup = setup1();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const time = scheduler.getTimeNextDue();
    t.equal(time, undefined, 'returns undefined');
    t.end();
  });

  t.test('No cards reviewed', t => {
    const setup = setup2();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const time = scheduler.getTimeNextDue();
    t.equal(time, undefined, 'returns undefined');
    t.end();
  });

  t.test('card due in the past', t => {
    const setup = setup3();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const time = scheduler.getTimeNextDue();
    t.ok(time !== undefined, 'does not return undefined');
    t.ok(time < now(), 'due in the past');
    t.end();
  });

  t.test('Card due in the future', t => {
    const setup = setup4();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config,
    });

    const time = scheduler.getTimeNextDue();
    t.ok(time !== undefined, 'does not return undefined');
    t.ok(time > now(), 'due in the future');
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
      studytime integer not null
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
      ord
    ) values
      ( 1, 1, UNIXEPOCH(), 0, 0, 0, 2, 0, 0),
      ( 1, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0),
      ( 2, 1, UNIXEPOCH(), 0, 0, 0, 2, 0, 0),
      ( 2, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0)
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
      studytime integer not null
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
      ord
    ) values
      ( 1, 1, UNIXEPOCH()-10, 5, 0, UNIXEPOCH()-5, 2, 0, 0),
      ( 1, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0),
      ( 2, 1, UNIXEPOCH(), 0, 0, 0, 2, 0, 0),
      ( 2, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0)
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
      studytime integer not null
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
      studytime
    ) values
      (@ts - 60000, @date, 1, 'good', 60 * 5, 0, 1.8, 10, 10)
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
      ord
    ) values
      ( 1, 1, UNIXEPOCH()-10, 5, 0, UNIXEPOCH()+5, 2, 0, 0),
      ( 1, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0),
      ( 2, 1, UNIXEPOCH(), 0, 0, 0, 2, 0, 0),
      ( 2, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0)
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
      studytime integer not null
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
      studytime
    ) values
      (@ts - 60000, @date, 1, 'good', 60 * 5, 0, 1.8, 10, 10)
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
  };

  return {
    db: db,
    srf: srf,
    config: config,
  };
}
