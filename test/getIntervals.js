'use strict';

const t = require('@ig3/test');

t.test('getIntervals', t => {
  t.test('No arguments', t => {
    const scheduler = require('..')(setup1());

    t.throws(
      () => {
        scheduler.getIntervals();
      },
      /Missing required argument/,
      'Throws with no arguments'
    );
    t.end();
  });

  t.test('learned card - max interval', t => {
    const scheduler = require('..')(setup1());
    const intervals = scheduler.getIntervals({
      id: 1,
      interval: 60 * 60 * 24 * 365,
      factor: 1.8,
    });
    t.equal(intervals.fail, 3600, 'interval fail');
    t.equal(intervals.hard, 86400, 'interval hard');
    t.equal(intervals.good, 31536000, 'interval good');
    t.equal(intervals.easy, 31536000, 'interval easy');
    t.end();
  });

  t.test('learned card - max interval, delayed review', t => {
    const scheduler = require('..')(setup1());
    const intervals = scheduler.getIntervals({
      id: 1,
      interval: 60 * 60 * 24 * 365,
      factor: 1.8,
    });
    t.equal(intervals.fail, 3600, 'interval fail');
    t.equal(intervals.hard, 86400, 'interval hard');
    t.equal(intervals.good, 31536000, 'interval good');
    t.equal(intervals.easy, 31536000, 'interval easy');
    t.end();
  });

  t.test('learned card - 1 week interval', t => {
    const scheduler = require('..')(setup1());
    const intervals = scheduler.getIntervals({
      id: 2,
      interval: 60 * 60 * 24 * 7,
      factor: 1.4,
    });
    t.equal(intervals.fail, 3600, 'interval fail');
    t.equal(intervals.hard, 86400, 'interval hard');
    t.equal(intervals.good, 934718, 'interval good');
    t.equal(intervals.easy, 1556755, 'interval easy');
    t.end();
  });

  t.test('learned card - 1 week interval, delayed review', t => {
    const scheduler = require('..')(setup1());
    const intervals = scheduler.getIntervals({
      id: 3,
      interval: 60 * 60 * 24 * 7,
      factor: 1.4,
    });
    t.equal(intervals.fail, 3600, 'interval fail');
    t.equal(intervals.hard, 86400, 'interval hard');
    t.equal(intervals.good, 1335312, 'interval good');
    t.equal(intervals.easy, 2223936, 'interval easy');
    t.end();
  });

  t.test('learning card - 6 day interval', t => {
    const scheduler = require('..')(setup1());
    const intervals = scheduler.getIntervals({
      id: 4,
      interval: 60 * 60 * 24 * 6,
      factor: 1.2,
    });
    t.equal(intervals.fail, 300, 'interval fail');
    t.equal(intervals.hard, 3600, 'interval hard');
    t.equal(intervals.good, 692841, 'interval good');
    t.equal(intervals.easy, 1157068, 'interval easy');
    t.end();
  });

  t.test('learning card - 6 day interval, delayed review', t => {
    const scheduler = require('..')(setup1());
    const intervals = scheduler.getIntervals({
      id: 5,
      interval: 60 * 60 * 24 * 6,
      factor: 1.2,
    });
    t.equal(intervals.fail, 300, 'interval fail');
    t.equal(intervals.hard, 3600, 'interval hard');
    t.equal(intervals.good, 923788, 'interval good');
    t.equal(intervals.easy, 1542758, 'interval easy');
    t.end();
  });

  t.test('learning card - 6 minute interval', t => {
    const scheduler = require('..')(setup1());
    const intervals = scheduler.getIntervals({
      id: 6,
      interval: 60 * 6,
      factor: 1.2,
    });
    t.equal(intervals.fail, 180, 'interval fail');
    t.equal(intervals.hard, 288, 'interval hard');
    t.equal(intervals.good, 481, 'interval good');
    t.equal(intervals.easy, 86400, 'interval easy');
    t.end();
  });

  t.test('learning card - 6 minute interval, delayed review', t => {
    const scheduler = require('..')(setup1());
    const intervals = scheduler.getIntervals({
      id: 7,
      interval: 60 * 6,
      factor: 1.2,
    });
    t.equal(intervals.fail, 180, 'interval fail');
    t.equal(intervals.hard, 288, 'interval hard');
    t.equal(intervals.good, 641, 'interval good');
    t.equal(intervals.easy, 86400, 'interval easy');
    t.end();
  });

  t.test('new card', t => {
    const scheduler = require('..')(setup1());
    const intervals = scheduler.getIntervals({
      id: 10,
      interval: 0,
    });
    t.equal(intervals.fail, 1, 'interval fail');
    t.equal(intervals.hard, 1, 'interval hard');
    t.equal(intervals.good, 300, 'interval good');
    t.equal(intervals.easy, 86400, 'interval easy');
    t.end();
  });

  t.test('failed after good card', t => {
    const scheduler = require('..')(setup1());
    const intervals = scheduler.getIntervals({
      id: 8,
      interval: 60,
      factor: 1.4,
    });
    t.equal(intervals.fail, 30, 'interval fail');
    t.equal(intervals.hard, 48, 'interval hard');
    t.equal(intervals.good, 66811, 'interval good');
    t.equal(intervals.easy, 111274, 'interval easy');
    t.end();
  });
  t.end();
});

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
      (@now - 1000 * 60 * 60 * 24 * 365, '2023-03-22', 1, 'good', 60 * 60 * 24 * 365, 60 * 60 * 24 * 365, 1.8, 10, 10),
      (@now - 1000 * 60 * 60 * 24 * 7, '2024-03-22', 2, 'good', 60 * 60 * 24 * 7, 60 * 60 * 24 * 6, 1.8, 10, 10),
      (@now - 1000 * 60 * 60 * 24 * 10, '2024-03-22', 3, 'good', 60 * 60 * 24 * 7, 60 * 60 * 24 * 6, 1.8, 10, 10),
      (@now - 1000 * 60 * 60 * 24 * 6, '2024-03-22', 4, 'good', 60 * 60 * 24 * 6, 60 * 60 * 24 * 3, 1.4, 10, 10),
      (@now - 1000 * 60 * 60 * 24 * 8, '2024-03-22', 5, 'good', 60 * 60 * 24 * 6, 60 * 60 * 24 * 3, 1.4, 10, 10),
      (@now - 1000 * 60 * 6, '2024-03-22', 6, 'good', 60 * 6, 60 * 3, 1.1, 10, 10),
      (@now - 1000 * 60 * 8, '2024-03-22', 7, 'good', 60 * 6, 60 * 3, 1.1, 10, 10),
      (@now - 1000 * 60 * 7, '2024-03-22', 8, 'good', 60 * 60 * 24, 60 * 3, 1.1, 10, 10),
      (@now - 1000 * 60, '2024-03-22', 8, 'fail', 60, 60 * 60, 1.1, 10, 10),
      (@now - 5000, '2024-03-22', 10, 'good', 60 * 60 * 7 * 24 + 5, 60, 1.8, 10, 10)
  `).run({
    now: Date.now(),
  });
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
    easyMinInterval: 60 * 60 * 24,
    easyFactor: 1.8,
    failFactor: 0.5,
    failLearningMaxInterval: 60 * 5,
    failMaxInterval: 60 * 60,
    goodFactor: 1.1,
    goodMinFactor: 1.1,
    goodMinInterval: 60 * 5,
    hardLearningMaxInterval: 60 * 60,
    hardMaxInterval: 60 * 60 * 24,
    learningThreshold: 60 * 60 * 24 * 7,
    matureThreshold: 60 * 60 * 24 * 21,
    maxGoodInterval: 60 * 60 * 24 * 365,
    maxEasyInterval: 60 * 60 * 24 * 365,
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
