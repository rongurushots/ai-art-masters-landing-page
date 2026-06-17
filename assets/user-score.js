/* AI Art Masters — User Score
 * Reputation primitive. Spec: docs/USER_SCORE.md.
 * Pure logic, no DOM — safe to unit-test and to reuse as the backend reference.
 * Exposes window.AAMScore (browser) and module.exports (Node).
 */
(function (root) {
  'use strict';

  // Score → level → mission access. Cumulative: a higher tier keeps lower unlocks.
  // Level numbers match the wallet line on the profile ("Level 3 · Comet").
  var TIERS = [
    { tier: 'Spark',     level: 1, min: 0,  max: 39,  unlocks: 'Open missions' },
    { tier: 'Meteor',    level: 2, min: 40, max: 59,  unlocks: 'Standard missions' },
    { tier: 'Comet',     level: 3, min: 60, max: 74,  unlocks: 'Higher-pay missions' },
    { tier: 'Nova',      level: 4, min: 75, max: 89,  unlocks: 'Premium missions' },
    { tier: 'Supernova', level: 5, min: 90, max: 100, unlocks: 'Invite-only, top-value missions' }
  ];

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function rate(accepted, rejected) {
    var n = accepted + rejected;
    return n > 0 ? accepted / n : 0;
  }

  /* Compute the 0–100 user score from a creator's review history.
   * history = {
   *   accepted, rejected,                 // lifetime reviewed counts
   *   guidelineAdherence,                 // avg reviewer rating 0..100 (instruction following)
   *   recentAccepted, recentRejected      // last ~10 reviewed (optional; for momentum)
   * }
   */
  function computeUserScore(history) {
    history = history || {};
    var accepted = history.accepted || 0;
    var rejected = history.rejected || 0;
    var adherence = clamp(history.guidelineAdherence || 0, 0, 100);

    var acceptanceRate = rate(accepted, rejected);
    var base = 0.5 * adherence + 0.5 * (acceptanceRate * 100);

    // Momentum: recent acceptance vs lifetime, ±5 points max.
    var momentum = 0;
    if (history.recentAccepted != null || history.recentRejected != null) {
      var recentRate = rate(history.recentAccepted || 0, history.recentRejected || 0);
      momentum = clamp(Math.round((recentRate - acceptanceRate) * 25), -5, 5);
    }

    return clamp(Math.round(base + momentum), 0, 100);
  }

  function tierForScore(score) {
    score = clamp(score || 0, 0, 100);
    for (var i = 0; i < TIERS.length; i++) {
      if (score <= TIERS[i].max) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }

  // Next tier up, or null if already at the top.
  function nextTier(score) {
    var cur = tierForScore(score);
    return TIERS[cur.level] || null; // TIERS[cur.level] is the entry after cur (level is 1-based)
  }

  // Progress (0..1) from the current tier floor toward the next tier floor.
  function progressToNext(score) {
    score = clamp(score || 0, 0, 100);
    var cur = tierForScore(score);
    var next = nextTier(score);
    if (!next) return 1;
    var span = next.min - cur.min;
    return span > 0 ? clamp((score - cur.min) / span, 0, 1) : 1;
  }

  var api = {
    TIERS: TIERS,
    computeUserScore: computeUserScore,
    tierForScore: tierForScore,
    nextTier: nextTier,
    progressToNext: progressToNext
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AAMScore = api;
})(typeof window !== 'undefined' ? window : this);
