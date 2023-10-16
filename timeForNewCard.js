'use strict';

const minReviews = require('./minReviews.js');

module.exports = function timeForNewCard () {
  const self = this;

  return self.reviewsSinceLastNewCard >= minReviews.call(self);
};
