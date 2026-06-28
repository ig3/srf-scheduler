# @ig3/srf-scheduler

This is the default scheduler for
[srf](https://www.npmjs.com/package/@ig3/srf) - spaced repetition
flashcards.

It's primary functions are:
 * selecting a card for review
 * re-scheduling a card after review

It controls two aspects of study:
 * average study time per day
 * percentage of cards successfully recalled

## installation

```
$ npm install @ig3/srf-scheduler
```

If you install [srf](https://www.npmjs.com/package/@ig3/srf), this
scheduler will be installed as one of its dependencies. There should be no
need to install this independently.

## Algorithms

There are two fundamental algorithms:
 * determining the next card to be reviewed
 * determining the next due date after a card is reviewed

There are two fundamental control mechanisms:
 * regulating the introduction of new cards
 * adjusting the interval between reviews

There are many details, heuristics and supporting algorithms. These are
described in some detail in the following sub-sections.

### new cards

Average study time per day is controlled by adjusting the presentation of
new cards.

New cards are presented, interleaved with reviews, unless the number of new
cards seen in the current calendar day is more than
`config.maxNewCardsPerDay`.

The number of reviews between new cards is adjusted according to the
difference between average study time per day and `config.studyTimeTarget`.
Sensitivity to this error signal is set by
`config.studyTimeErrorSensitivity`.

The number of reviews between new cards is set to the predicted number of
reviews in the next 24 hours divided by the recent average number of new
cards per day, adjusted up or down according to the difference between
average study time and target study time.

The predicted number of reviews is the number of cards due in the next 24
hours multiplied by the recent average number of reviews per day per card.

It is possible to study more cards if one wishes. The `Study` button on the
home page will provide either a due card or a new card to study, regardless
of the number of new cards already seen.

### review card selection

Every card that has been viewed has a time when it is scheduled to be
reviewed.

If there is more than one card past its scheduled review time, then one of
two algorithms is used to select the next card for review:
 * shortest interval first
 * earliest due first

The algorithm is selected randomly, with probability of the earliest due
cards being selected first determined by configuration parameter
config.probabilityOldestDue.

For both algorithms, the first five cards are determined and one of these
is selected at random. The randomization ensures that cards are not
reviewed in a fixed order, making the review more independent.

### interval adjustments

Interval is the interval between card reviews. The interval of a card is
updated each time it is reviewed, according to its 'ease' (Fail, Hard,
Good or Easy). Interval (and due date) are also adjusted after any card
with an interval greater than learningThreshold is reviewed, according to
the difference between 'percent correct' and percentCorrectTarget.

#### Fail

If the ease of a review is Fail, then the new interval is the previous
interval multiplied by failFactor, with an upper bound of
failLearningMaxInterval if the previous interval was less than
learningThreshold or failMaxInterval otherwise.

#### Hard

If the ease of a review is Hard, then the new interval is the previous
interval multiplied by hardFactor, with an upper bound of
hardLearningMaxInterval if the previous interval was less than
learningThreshold or hardMaxInterval otherwise.

#### Good

If the ease of a review is Good, then the new interval is the greater of
 * goodMinInterval
 * recent average interval multiplied by goodMinFactor
 * recent average interval multiplied by the product of goodFactor
   and the card factor

The new interval is limited to the lesser of maxInterval or
maxGoodInterval.

The recent average interval is the average of the last
config.recentIntervalWindow intervals (default 3). For the most recent
interval, the actual interval is used rather than the scheduled interval.
The actual interval will be longer than the scheduled interval when the
card is not reviewed immediately when due.

The card factor is the exponentially weighted moving average of ease
weights, with a decay factor of decayFactor and ease weights of weightFail,
weightHard, weightGood and weightEasy. This reflects how easy or difficult
the card has been recently.


#### Easy

If the ease of a review is Easy, then the recent average interval
multiplied by the easyFactor and the card factor, with a minimum of
easyMinInterval and maximum of the lower of maxEasyInterval and maxInteral.

The recent average interval is the same as for ease Good.

### Percent Correct

This is the percentage of reviews that are not rated 'Fail'.

This is calculated with both a time window and an interval window.

The time window is config.percentCorrectWindow. Only reviews within this
window are considered.

The interval window is config.matureThreshold to config.maxInterval
(exclusive). This excludes reviews of new cards and cards at maximum
interval. The excluded cards are not the target of review difficulty
control.

If there are fewer than config.minPercentCorrectCount reviews within
these windows, then the lower bound on interval is removed.

When a card is reviewed and the new interval is greater than
config.learningThreshold, then the intervals and due dates of all cards with
interval between learningThreshold and maxInterval are adjusted according
to the difference between 'percent correct' and config.percentCorrectTarget,
multiplied by percentCorrectSensitivity. This adjustment makes reviews
sooner or later, to achieve the target percent correct.

## Configuration

The scheduler is configured by the following configuration parameters.

### config.decayFactor

decayFactor determines the exponential decay of ease weight to determine
the card ease factor. The resulting card ease factor is one of the factors
that contributes the overall factor by which interval is increased for Good
and Easy responses.

### config.easyFactor

The interval for an Easy response is the interval for a Good response
multiplied by easyFactor.

### config.easyMinInterval

easyMinInterval is the minimum interval after an Easy response.

### config.failFactor

failFactor is the factor by which interval is multiplied after a Fail
response.

### config.failLearningMaxInterval

failLearningMaxInterval is the maximum interval after a Fail response for a
card with interval less than learningThreshold.

### config.failMaxInterval

failMaxInterval is the maximum interval after a Fail response.

### config.goodFactor

After a Good response, the interval is multiplied by goodFactor and the
card ease factor. The product of these is the overal factor by which
interval is multiplied.

### config.goodMinFactor

goodMinFactor is the minimum factor by which interval is multiplied after a
Good response. 

### config.goodMinInterval

goodMinInterval is the minimum interval after a Good response.

### config.hardFactor

hardFactor is the factor by which interval is multiplied after a Hard
response.

### config.hardLearningMaxInterval

hardLearningMaxInterval is the maximum interval after a Hard response for a
card with interval less than learningThreshold.

### config.hardMaxInterval

hardMaxInterval is the maximum interval after a Hard response.

### config.learningThreshold

learningThreshold is the threshold between cards being treated as 'new' and
'learning' cards.

Card intervals and due dates are modified periodically if their interval is
between learningThreshold and maxInterval.

### config.matureThreshold

matureThreshold is the threshold between cards being treaded as 'learning'
and 'mature' cards.

### config.maxEasyInterval

maxEasyInterval is an upper bound on interval after an Easy response.

### config.maxGoodInterval

maxGoodInterval is an upper bound on interval after a Good response.

### config.maxInterval

maxInterval is an upper bound on interval after a Good or Easy response.

### config.maxNewCardsPerDay

maxNewCardsPerDay is the maximum number of new cards which may be presented
in a local time calendar day.

### config.maxViewTime

maxViewTime is an upper bound on view time recorded in revlog. It doesn't
have anything to do with the scheduler. It is here for historic reasons,
pending refactoring the processing of card reviews.

### config.minPercentCorrectCount

minPercentCorrectCount is the minimum number of reviews of mature cards in
the percentCorrectWindow in order that 'percent correct' is calculated. The
'percent correct' is a factor in adjusting the intervals and due dates of
cards.

### config.minStudyTime

minStudyTime is the minimum study time in a 24 hour period below which new
cards will be presented in preference to due cards. 

### config.minTimeBetweenRelatedCards

Related cards are cares generated from the same field set.
minTimeBetweenRelatedCards is the minimum time between reviews of related
cards.

### config.percentCorrectSensitivity

percentCorrectSensitivity is a factor that determines the sensitivity to
the difference between 'percent correct' and percentCorrectTarget. It
determines how much the intervals and due dates of cards are modified when
adjusted for percent correct.

### config.percentCorrectTarget

percentCorrectTarget is the target for 'percent correct'. Below this,
intervals are reduced and due dates moved closer. Above this, intervals are
increased and due dates moved further away.

### config.percentCorrectWindow

percnetCorrectWindow is the window over which 'percent correct' is
calculated. Reviews longer ago than this do not contribute.

### config.probabilityOldestDue

probabilityOldestDue is the probability the scheduler will select cards
according to due date rather than interval.

### config.studyTimeTarget

studyTimeTarget is an upper bound on study time in a 24 hour period above
which new cards will not be presented.

### config.weightEasy

weightEasy is the weight of an Easy response in calculating the card ease
factor by a process of moving average exponential decay.

### config.weightFail

weightFail is the weight of a Fail response in calculating the card ease
factor by a process of moving average exponential decay.

### config.weightGood

weightGood is the weight of a Good response in calculating the card ease
factor by a process of moving average exponential decay.

### config.weightHard

weightHard is the weight of an Hard response in calculating the card ease
factor by a process of moving average exponential decay.

## API

### getAverageStudyTimePerCard

Returns the average study time per card in seconds, averaged over the
specified number of study days. Days without study are ignored. The current
day is ignored if there are prior study days.

The purpose of this function is to estimate the study time in the next 24
hours, calculated as the number of cards due multiplied by this average.

### getAverageStudyTimePerDay

Returns an exponentially weighted moving average of study time per day as
seconds per day. The smoothing factor, alpha, is a function of the number
of days averaged: `2 / (days + 1)`. The `days` are intervals of 86400
seconds (24 hours), counting back from current, limited to days since first
review. Days without study are included in the average. The default window
is 7 days.

### getCountCardsDueToday

Returns the number of cards to be reviewed between now and the end of the
current day in localtime, excluding deferred cards.

### getCountNewCardsToday

Returns the number of new cards studied since the start of the current
calendar day.

### getIntervals(card)

Returns an object with the new interval for each possible ease for the
given card.

### getNextCard(overrideLimits)

Returns the next card to be studied or undefined.

If overrideLimits is true, a card is returned unless there are no due cards
and no new cards available. If `reviewsToNextNew` is 0 then a new card is
preferred, otherwise a due card is preferred.

Otherwise, if all the following conditions are satisfied:
 * average study time per day is less than `config.studyTimeTarget`
 * new cards seen today is less than `config.maxNewCardsPerDay`
 * reviews to next new card is 0

Then the next new card is returned, or the next due card, if there is no
new card available, or no card if there is neither a new card nor a due
card available.

Otherwise the next due card is returned or, if there is no due card
available, then no card is returned.

### getNextDue(overrideLimits)

getNextDueCard returns a card if one is due, otherwise undefined.

If overrideLimits is true then getNextDueCard one of the five cards with
the earliest due dates, selected ramdomly, regardless of whether they are
due before or after the current time.

Otherwise, getNextDue selects a sort algorithm randomly, according to
config.probabilityOldestDue: sort by interval or sort by due.

In either case, one of the first 5 cards, according to the sort algorithm,
is selected at random.

### getNextNew

getNextnew returns a new card if one is available, otherwise undefined.

New cards (cards with interval = 0) are sorted by ord, then id.

New cards are ignored if a card from the same fieldset is due within
config.minTimeBetweenRelatedCards or if a card from the same fieldset has
been reviewed within config.minTimeBetweenRelatedCards.

### getReviewsToNextNew

Returns the number of reviews to be completed before the next new card is
presented.

The number is the predicted number of reviews in the next 24 hours divided
by the average number of new cards per day, adjusted according to the
difference between study time and `config.studyTimeTarget`.

Study time is the maximum of average study time, study time today and
predicted study time in the next 24 hours.

The predicted number of reviews in the next 24 hours is the number of cards
due in the next 24 hours multiplied by the average number of reviews per
card per day.

If there are cards due, then the minimum is 1, otherwise it is 0.

### getStatsNext24Hours

Returns an object with properties:
 * cardsDue
 * count
 * minReviews
 * reviewsToNextNew
 * time

cardsDue is the number of cards with a due date less than 24 hours from
now.

count is the estimated number of cards to be reviewed in the next 24 hours.
This is cardsDue plus the average number of new cards per day.

minReviews is the minimum number of reviews between new cards. This is what
reviewsToNextNew will be set to after viewing a new card.

reviewsToNextNew is the number of reviews before a new card may be selected
by getNextCard. This is decremented after each review. When it is 0, a new
card will be presented, unless the number of new cards seen in the current
calendar day is more than `config.maxNewCardsPerDay`.

time is an estimate of the time to review the estimated number of cards to
be reviewed in the next 24 hours. This is the number of cards multiplied by
the average time per card per day. This is not the average time per review.
It factors in the average number of reviews of a card in a day. It is the
average total time per card per day.

### getTimeNextDue

Returns the time (seconds since the epoch) when the card with the earliest
due time is due. This may be in the past or in the future, depending on
current backlog.

### review(card, viewTime, studyTime, ease)

Updates the given card, setting new interval and due, according to ease and
creates a revlog record recording the review of the card.

The new interval and due are calculated according to the ease.

### shutdown

Save state and disconnect from database.

## Changes

### 1.0.1 - 20231007
 * README updates
 * Default config parameters relevant to the scheduler
 * Fix error in intervalEasy
 * Fix typo in getNextNew

### 1.0.2 - 20231008
 * Fix getStatsNext24Hours

### 1.1.0 - 20231011
 * Simplify and improve getAverageStudyTimePerNewCard and
   getAverageStudyTimePerOldCard
 * Refactor calculation of stats for next 24 hours
 * Improve getStatsNext24Hours - better estimates, including new cards
 * Add API method: getNewCardMode
 * refactor getNextCard to use getNewCardMode
 * Fix calculation of average new cards per day
 * Exclude current date from estimate of time per card and new cards per day
 * Refactor getNextCard and change new card interval

### 1.1.1 - 20231013
 * Adjust time between new cards according to average study time

### 1.1.2 - 20231014
 * Fix typo

### 1.1.3 - 20231014
 * Fix call to getAverageStudyTime

### 1.1.4 - 20231014
 * Add some tests - not very good but better than nothing

### 1.2.0 - 20231016
 * Add test for formatLocalDate
 * Introduce new cards slowly if predicted study time in the next 24 hours
   is more than config.minStudyTime.

### 1.3.0 - 20231016
 * Refactor formatLocalDate
 * Refactor getPercentCorrect
 * Refactor adjustCards
 * Refactor deferRelated
 * Refactor getCardsToReview
 * Refactor getAverageNewCardsPerDay
 * Refactor getAverageReviewsPerDay
 * Refactor getAverageStudyTime
 * Refactor timeForNewCard
 * Refactor minReviews
 * Add minReviews to getStatsNext24Hours result
 * Add config.newCardRateFactor
 * Base minReviews on cards to study next 24 hours not average

### 1.3.1 - 20231017
 * Test minReviews with 0 new cards per day

### 1.3.2 - 20231030
 * Don't include average new cards in stats for next 24 hours
 * Add test for getNewCardMode
 * Fix test of getStatsNext24Hours
 * Add test for getIntervals
 * Add test for getNextDue
 * Add test for getNextNew
 * Average study time over past and next 24 hours
 * Limit range of minReviews

### 2.0.0 - 20231125
 * Average study time over longer period to determine new card mode
 * Replace reviewsSinceLastNew with reviewsToNextNew

### 2.0.1 - 20231125
 * truncate reviewsToNextNew to integer on start

### 2.0.2 - 20240210
 * revise scheduling of new cards
 * fix typoe in newCardFactor
 * handle 'NaN' as card.factor (and other such invalid values)

### 2.0.3 - 20240314
 * Fix tests to handle reviewsPerNewCard parameter
 * Change intervalEasy to use actual interval

### 2.1.0 - 20240322
 * Introduce failLearningMaxInterval and hardLearningMaxInterval
 * Base interval for Good on actual interval

### 2.1.1 - 20240521
 * Make getReviewsToNextNew a bit more aggressive
 * Get new value for minReviews with each call to getStatsNext24Hours
 * Save reviews to next new card to database at each review
 * Limit reviews per new card
 * Update dependencies

### 2.1.2 - 20240814
 * Fix adjustCards to not set interval larger than maxInterval
 * Change test for reviewed cards from interval != 0 to interval > 0
 * Change test for new cards from interval = 0 to interval <= 0
 * Reduce minimum interval for Good to 2 minutes
 * Update dependencies
 * Replace tape with @ig3/test

### 2.1.3 - 20240912
 * Remove lapses
 * Simplify adjustCards
 * Handle the case that no configuration is provided
 * increase maximum intervals for failed and hard reviews

### 2.1.4 - 20241206
 * Change good and easy intervals to be based on longest recent interval
 * Reduce window for average study time.
 * Update dependencies

### 2.2.0 - 20260602
 * Reduce percentCorrectSensitivity
 * Fix getCardsToReview
 * Reduce goodMinInterval
 * Fix default maxGoodInterval
 * Use a weighted average for study time
 * Randomize due date to disperse clusters of cards
 * Add latency, backlog and overdue to dailystats
 * Don't exclude current day from average new cards per day
 * Calculate percent correct across all reviews if insufficient reviews
   in the interval window
 * Minimum 1 review per new card
 * Increase maxNewCardsPerDay to 50
 * Fix estimate of study time per card in getStatsNext24Hours
 * Allow new cards after 23 hours to avoid perpetual shift to later
 * Fix getAverageNewCardsPerDay
 * Remove obsolete minReviews
 * Fix getWeightedAverageStudyTime
 * Change git repository to https://codeberg.org/ig3/srf-scheduler.git

### 3.0.0 - 20260617
 * Reduce default maxNewCardsPerDay to 20
 * Include average new cards per day in estimate of cards in next 24 hours
 * Fix getStatsNext24Hours
 * Fix getAverageStudyTime
 * Remove getWeightedAverageStudyTime
 * Change getNextCard to present new cards more aggressively
 * Change getAverageStudyTime to getAverageStudyTimePerDay
 * Change changes to getNewCardMode
 * Change getNewCardMode
 * Change getAverageNewCardsPerDay
 * Change getAverageReviewsPerDay
 * Change getAverageStudyTimePerDay
 * Add getAverageStudyTimePerCard
 * Refactor getNextCard
 * Change getReviewsToNextNew

### 3.0.1 - WIP
 * Add getAverageNewCardsPerDay and getAverageReviewPerDay to api
 * Add cardsDue to getStatsNext24Hours
 * Fix getAverageNewCardsPerDay
 * Rename getCardsToReview to getCardsDue
 * Change getNewCardMode
 * Change getStatsNext24Hours
 * Change getAverageStudyTimePerDay
 * Remove getNewCardMode
 * Change getNextCard
 * Change getReviewsToNextNew
 * Change studyTimeErrorSensitivity
