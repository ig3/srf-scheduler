'use strict';

const t = require('tape');

t.test('formatLocalDate', t => {
  t.test('New card', t => {
    const setup = setup1();
    const scheduler = require('..')({
      db: setup.db,
      srf: setup.srf,
      config: setup.config
    });

    const d1 = scheduler.private.formatLocalDate(new Date('2023-10-01T01:02:03.000Z'));
    console.log('d1: ', d1);
    t.equal(d1, '2023-10-01', 'leading zeros');
    const d2 = scheduler.private.formatLocalDate(new Date('2023-10-11T01:02:03.000Z'));
    console.log('d2: ', d2);
    t.equal(d2, '2023-10-11', 'no leading zeros');
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
    ['years', 3600 * 24 * 365]
  ];
  for (let i = 0; i < units.length; i++) {
    if (units[i][0].startsWith(unit)) return units[i][1];
  }
  throw new Error('Unsupported unit: ', unit);
}

// Return seconds since the epoch
// eslint-disable-next-line
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
        time: 0
      };
    },
    getStatsPast24Hours: function () {
      return {
        count: 0,
        time: 0,
        newCards: 0
      };
    },
    getCountCardsOverdue: function () {
      return 0;
    },
    resolveUnits: resolveUnits
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
    hardFactor: 0.8
  };

  return {
    db: db,
    srf: srf,
    config: config
  };
}
