'use strict';

const t = require('@ig3/test');

t.test('getNextCard', t => {
  t.test('initial conditions', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 0,
      getNextDue: () => null,
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, 'new', 'Get a new card');
    t.end();
  });
  t.test('No cards available', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 0,
      getNextDue: () => null,
      getNextNew: () => null,
      reviewsToNextNew: 0,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Due card available', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 0,
      getNextDue: () => 'due',
      getNextNew: () => null,
      reviewsToNextNew: 0,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('New card available', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 0,
      getNextDue: () => null,
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.test('New and due cards available', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 0,
      getNextDue: () => 'new',
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.test('1 review to next new, no cards available', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 0,
      getNextDue: () => null,
      getNextNew: () => null,
      reviewsToNextNew: 1,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('1 review to next new, due card available', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 0,
      getNextDue: () => 'due',
      getNextNew: () => null,
      reviewsToNextNew: 1,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('1 review to next new, new and due cards available', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 0,
      getNextDue: () => 'due',
      getNextNew: () => 'new',
      reviewsToNextNew: 1,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Max new cards, no cards available', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 20,
      getNextDue: () => null,
      getNextNew: () => null,
      reviewsToNextNew: 0,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Max new cards, due card available', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 20,
      getNextDue: () => 'due',
      getNextNew: () => null,
      reviewsToNextNew: 0,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Max new cards, new card available', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 20,
      getNextDue: () => null,
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Max new cards, new and due cards available', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 20,
      getNextDue: () => 'due',
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
      config: {
        maxNewCardsPerDay: 20,
      }
    });

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Override, no new, no due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 20,
      getNextDue: () => null,
      getNextNew: () => null,
      reviewsToNextNew: 1,
      config: {
        maxNewCardsPerDay: 20,
      }
    }, true);

    t.equal(card, null, 'No card');
    t.end();
  });
  t.test('Override, no new, due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 20,
      getNextDue: () => 'due',
      getNextNew: () => null,
      reviewsToNextNew: 1,
      config: {
        maxNewCardsPerDay: 20,
      }
    }, true);

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Override, new, no due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 20,
      getNextDue: () => null,
      getNextNew: () => 'new',
      reviewsToNextNew: 1,
      config: {
        maxNewCardsPerDay: 20,
      }
    }, true);

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.test('Override, new, due, reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 20,
      getNextDue: () => 'due',
      getNextNew: () => 'new',
      reviewsToNextNew: 1,
      config: {
        maxNewCardsPerDay: 20,
      }
    }, true);

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.test('Override, new, due, no reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 20,
      getNextDue: () => 'due',
      getNextNew: () => 'new',
      reviewsToNextNew: 0,
      config: {
        maxNewCardsPerDay: 20,
      }
    }, true);

    t.equal(card, 'new', 'New card');
    t.end();
  });
  t.test('Override, no new, due, no reviewsToNextNew', t => {
    const getNextCard = require('../getNextCard.js');

    const card = getNextCard.call({
      getCountNewCardsToday: () => 20,
      getNextDue: () => 'due',
      getNextNew: () => null,
      reviewsToNextNew: 0,
      config: {
        maxNewCardsPerDay: 20,
      }
    }, true);

    t.equal(card, 'due', 'Due card');
    t.end();
  });
  t.end();
});
