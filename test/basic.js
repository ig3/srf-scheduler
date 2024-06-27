'use strict';

const t = require('node:test');
const assert = require('node:assert/strict');

t.test('eslint', t => {
  const config = require('../eslint.config.js');
  assert.equal(typeof config, 'object', 'eslint config provides an object');
});

t.test('load', t => {
  const scheduler = require('..')({
    srf: {
      getParam: function (name) {
        if (name === 'reviewsToNextNew') return 7;
        if (name === 'reviewsPerNewCard') return 14;
        throw new Error('Unsupported param: ' + name);
      },
      setParam: function (name, value) {
      },
    },
  });
  assert(true, 'loaded');
  [
    'getNextCard',
    'review',
    'getIntervals',
    'getNextDue',
    'getNextNew',
  ].forEach(method => {
    assert(typeof scheduler[method] === 'function', 'method ' + method + ' exists');
  });
});

t.test('getNextCard', t => {
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
      (@ts - 30 * 24 * 60 * 60 * 1000, @date, 2, 'good', 60 * 60 * 24 * 45, 60 * 60 * 24 * 40, 1.8, 30, 30, 0),
      (@ts - 25 * 24 * 60 * 60 * 1000, @date, 2, 'good', 60 * 60 * 24 * 45, 60 * 60 * 24 * 40, 1.8, 30, 30, 0),
      (@ts - 24 * 24 * 60 * 60 * 1000, @date, 2, 'good', 60 * 60 * 24 * 45, 60 * 60 * 24 * 40, 1.8, 30, 30, 0),
      (@ts - 23 * 24 * 60 * 60 * 1000, @date, 2, 'good', 60 * 60 * 24 * 45, 60 * 60 * 24 * 40, 1.8, 30, 30, 0)
  `).run({
    ts: Date.now(),
    date: dateDaysAgo(30),
  });

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

  const srf = {
    getStatsNext24Hours: function () {
      return {
        cards: 5,
        time: 15,
      };
    },
    getStatsPast24Hours: function () {
      return {
        count: 15,
        time: 15,
        newCards: 5,
      };
    },
    getCountCardsOverdue: function () {
      return 0;
    },
    getAverageStudyTime: function () {
      return 1800;
    },
    resolveUnits: function (value) {
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
    },
    getParam: function (name) {
      if (name === 'reviewsToNextNew') return 7;
      if (name === 'reviewsPerNewCard') return 14;
      throw new Error('Unsupported param: ' + name);
    },
    setParam: function (name, value) {
    },
  };
  const scheduler = require('..')({
    db: db,
    srf: srf,
    config: {
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
    },
  });

  let card;
  card = scheduler.getNextCard();
  assert(card, 'got card');
  assert.equal(card.id, 1, 'got card 1');

  card = scheduler.getNextDue(true);

  scheduler.review(
    {
      id: 1,
      fieldsetid: 1,
      templateid: 1,
      modified: Math.floor(Date.now() / 1000),
      interval: 600,
      lastinterval: 300,
      due: 0,
      factor: 2,
      views: 1,
      lapses: 0,
      ord: 3,
    },
    20,
    30,
    'fail'
  );
  wait(1000);
  scheduler.review(
    {
      id: 1,
      fieldsetid: 1,
      templateid: 1,
      modified: Math.floor(Date.now() / 1000),
      interval: 600,
      lastinterval: 300,
      due: 0,
      factor: 2,
      views: 1,
      lapses: 0,
      ord: 3,
    },
    20,
    30,
    'hard'
  );
  wait(1000);
  scheduler.review(
    {
      id: 1,
      fieldsetid: 1,
      templateid: 1,
      modified: Math.floor(Date.now() / 1000),
      interval: 600,
      lastinterval: 300,
      due: 0,
      factor: 2,
      views: 1,
      lapses: 0,
      ord: 3,
    },
    20,
    30,
    'good'
  );
  wait(1000);
  scheduler.review(
    {
      id: 1,
      fieldsetid: 1,
      templateid: 1,
      modified: Math.floor(Date.now() / 1000),
      interval: 600,
      lastinterval: 300,
      due: 0,
      factor: 2,
      views: 1,
      lapses: 0,
      ord: 3,
    },
    20,
    30,
    'easy'
  );
  wait(1000);
  scheduler.review(
    {
      id: 2,
      fieldsetid: 1,
      templateid: 2,
      modified: Math.floor(Date.now() / 1000),
      interval: 60 * 60 * 24 * 10,
      lastinterval: 60 * 60 * 24 * 8,
      due: 0,
      factor: 2,
      views: 1,
      lapses: 0,
      ord: 3,
    },
    20,
    30,
    'good'
  );

  wait(1000);
  scheduler.getIntervals(
    {
      id: 2,
      fieldsetid: 1,
      templateid: 2,
      modified: Math.floor(Date.now() / 1000),
      interval: 60 * 60 * 24 * 10,
      lastinterval: 60 * 60 * 24 * 8,
      due: 0,
      factor: 2,
      views: 1,
      lapses: 0,
      ord: 3,
    }
  );

  wait(1000);
  assert.throws(
    () => {
      scheduler.review(
        {
          id: 2,
          fieldsetid: 1,
          templateid: 2,
          modified: Math.floor(Date.now() / 1000),
          interval: 60 * 60 * 24 * 10,
          lastinterval: 60 * 60 * 24 * 8,
          due: 0,
          factor: 2,
          views: 1,
          lapses: 0,
          ord: 3,
        },
        20,
        30,
        'nonesuch'
      );
    },
    undefined,
    'throws on invalid ease'
  );

  wait(1000);
  scheduler.review(
    {
      id: 2,
      fieldsetid: 1,
      templateid: 2,
      modified: Math.floor(Date.now() / 1000),
      interval: 60 * 60 * 24 * 10,
      lastinterval: 60 * 60 * 24 * 8,
      due: 0,
      factor: 2,
      views: 1,
      lapses: 0,
      ord: 3,
    },
    500,
    500,
    'good'
  );

  Math.random = function () {
    return 0.2;
  };
  card = scheduler.getNextDue();

  Math.random = function () {
    return 0.8;
  };
  card = scheduler.getNextDue();

  srf.getCountCardsOverdue = function () {
    return 1;
  };
  card = scheduler.getNextCard();

  const stats = scheduler.getStatsNext24Hours();
  assert(stats, 'got stats');
});

function wait (ms) {
  const now = Date.now();
  while (Date.now() - now < ms) { /* do nothing */ }
}

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
