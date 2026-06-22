'use strict';

const t = require('@ig3/test');

t.test('getNextCard', t => {
  t.test('initial conditions', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'go',
      getNextDue: () => null,
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
    });

    t.equal(card, 'new', 'Get a new card');
    t.end();
  });
  t.test('Stop, no new, no due', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'stop',
      getNextDue: () => null,
      getNextNew: () => null,
      reviewsToNextNew: 0,
    });

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Stop, no new, due', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'stop',
      getNextDue: () => 'due',
      getNextNew: () => null,
      reviewsToNextNew: 0,
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Stop, new, no due', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'stop',
      getNextDue: () => null,
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
    });

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Stop, new, due', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'stop',
      getNextDue: () => 'new',
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
    });

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.test('Slow, no new, no due', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'slow',
      getNextDue: () => null,
      getNextNew: () => null,
      reviewsToNextNew: 0,
    });

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Slow, no new, due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'slow',
      getNextDue: () => 'due',
      getNextNew: () => null,
      reviewsToNextNew: 1,
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Slow, new, no due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'slow',
      getNextDue: () => null,
      getNextNew: () => 'new',
      reviewsToNextNew: 1,
    });

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Slow, new, due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'slow',
      getNextDue: () => 'due',
      getNextNew: () => 'new',
      reviewsToNextNew: 1,
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Slow, no new, no due, no reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'slow',
      getNextDue: () => null,
      getNextNew: () => null,
      reviewsToNextNew: 0,
    });

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Slow, no new, due, no reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'slow',
      getNextDue: () => 'due',
      getNextNew: () => null,
      reviewsToNextNew: 0,
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Slow, new, no due, no reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'slow',
      getNextDue: () => null,
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
    });

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.test('Slow, new, due, no reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'slow',
      getNextDue: () => 'due',
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
    });

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.test('Go, no new, no due, no reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'go',
      getNextDue: () => null,
      getNextNew: () => null,
      reviewsToNextNew: 0,
    });

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Go, no new, due, no reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'go',
      getNextDue: () => 'due',
      getNextNew: () => null,
      reviewsToNextNew: 0,
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Go, new, no due, no reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'go',
      getNextDue: () => null,
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
    });

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.test('Go, new, due, no reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'go',
      getNextDue: () => 'new',
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
    });

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.test('Go, no new, no due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'go',
      getNextDue: () => null,
      getNextNew: () => null,
      reviewsToNextNew: 1,
    });

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Go, no new, due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'go',
      getNextDue: () => 'due',
      getNextNew: () => null,
      reviewsToNextNew: 1,
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Go, new, no due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'go',
      getNextDue: () => null,
      getNextNew: () => 'new',
      reviewsToNextNew: 1,
    });

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.test('Go, new, due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'go',
      getNextDue: () => 'due',
      getNextNew: () => 'new',
      reviewsToNextNew: 1,
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Override, no new, no due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'stop',
      getNextDue: () => null,
      getNextNew: () => null,
      reviewsToNextNew: 1,
    }, true);

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Override, no new, due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'stop',
      getNextDue: () => 'due',
      getNextNew: () => null,
      reviewsToNextNew: 1,
    }, true);

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Override, new, no due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'stop',
      getNextDue: () => null,
      getNextNew: () => 'new',
      reviewsToNextNew: 1,
    }, true);

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.test('Override, new, due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'stop',
      getNextDue: () => 'due',
      getNextNew: () => 'new',
      reviewsToNextNew: 1,
    }, true);

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Override, new, due, no reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getNewCardMode: () => 'stop',
      getNextDue: () => 'due',
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
    }, true);

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.end();
});
