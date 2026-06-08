'use strict';

const t = require('@ig3/test');

t.test('getNewCardMode', t => {
  t.test('No study', t => {
    const scheduler = require('..')(setup());

    // Mock supporting functions
    scheduler.getStudyTime = () => {
      return 0;
    };
    scheduler.getStatsNext24Hours = () => {
      return {
        time: 0,
      };
    };
    scheduler.getAverageStudyTimePerDay = () => {
      return 0;
    };
    scheduler.getCountNewCardsToday = () => {
      return 0;
    };
    scheduler.srf.getCountCardsOverdue = () => {
      return 0;
    };

    const mode = scheduler.getNewCardMode();
    t.equal(mode, 'go', 'Mode is go');
    t.end();
  });

  t.test('studyTime = targetStudyTime', t => {
    const scheduler = require('..')(setup());

    // Mock supporting functions
    scheduler.getStudyTime = () => {
      return 3600;
    };
    scheduler.getStatsNext24Hours = () => {
      return {
        time: 3600,
      };
    };
    scheduler.getAverageStudyTimePerDay = () => {
      return 3600;
    };
    scheduler.getCountNewCardsToday = () => {
      return 0;
    };
    scheduler.srf.getCountCardsOverdue = () => {
      return 0;
    };

    const mode = scheduler.getNewCardMode();
    t.equal(mode, 'stop', 'mode is stop');
    t.end();
  });

  t.test('new cards today = maxNewCardsPerDay', t => {
    const scheduler = require('..')(setup());

    // Mock supporting functions
    scheduler.getStudyTime = () => {
      return 0;
    };
    scheduler.getStatsNext24Hours = () => {
      return {
        time: 0,
      };
    };
    scheduler.getAverageStudyTimePerDay = () => {
      return 0;
    };
    scheduler.getCountNewCardsToday = () => {
      return 20;
    };
    scheduler.srf.getCountCardsOverdue = () => {
      return 0;
    };

    const mode = scheduler.getNewCardMode();
    t.equal(mode, 'stop', 'Mode is stop');
    t.end();
  });

  t.test('overdue cards', t => {
    const scheduler = require('..')(setup());

    // Mock supporting functions
    scheduler.getStudyTime = () => {
      return 0;
    };
    scheduler.getStatsNext24Hours = () => {
      return {
        time: 0,
      };
    };
    scheduler.getAverageStudyTimePerDay = () => {
      return 0;
    };
    scheduler.getCountNewCardsToday = () => {
      return 0;
    };
    scheduler.srf.getCountCardsOverdue = () => {
      return 1;
    };

    const mode = scheduler.getNewCardMode();
    t.equal(mode, 'stop', 'Mode stop');
    t.end();
  });

  t.test('studyTime < minStudyTime', t => {
    const scheduler = require('..')(setup());

    // Mock supporting functions
    scheduler.getStudyTime = () => {
      return 300;
    };
    scheduler.getStatsNext24Hours = () => {
      return {
        time: 300,
      };
    };
    scheduler.getAverageStudyTimePerDay = () => {
      return 300;
    };
    scheduler.getCountNewCardsToday = () => {
      return 0;
    };
    scheduler.srf.getCountCardsOverdue = () => {
      return 0;
    };

    const mode = scheduler.getNewCardMode();
    t.equal(mode, 'go', 'Mode go');
    t.end();
  });

  t.test('studyTime = minStudyTime, projected < targetStudyTime', t => {
    const scheduler = require('..')(setup());

    // Mock supporting functions
    scheduler.getStudyTime = () => {
      return 1200;
    };
    scheduler.getStatsNext24Hours = () => {
      return {
        time: 1200,
      };
    };
    scheduler.getAverageStudyTimePerDay = () => {
      return 1200;
    };
    scheduler.getCountNewCardsToday = () => {
      return 0;
    };
    scheduler.srf.getCountCardsOverdue = () => {
      return 0;
    };

    const mode = scheduler.getNewCardMode();
    t.equal(mode, 'go', 'Mode go');
    t.end();
  });

  t.test('studyTime = minStudyTime, projected = targetStudyTime', t => {
    const scheduler = require('..')(setup());

    // Mock supporting functions
    scheduler.getStudyTime = () => {
      return 1200;
    };
    scheduler.getStatsNext24Hours = () => {
      return {
        time: 3600,
      };
    };
    scheduler.getAverageStudyTimePerDay = () => {
      return 1200;
    };
    scheduler.getCountNewCardsToday = () => {
      return 0;
    };
    scheduler.srf.getCountCardsOverdue = () => {
      return 0;
    };

    const mode = scheduler.getNewCardMode();
    t.equal(mode, 'slow', 'Mode slow');
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

// Empty DB - no cards and no review logs

function setup () {
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

  // Mock getStatsPast24Hours
  const srf = {
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
    getAverageStudyTime: function () {
      return 0;
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
