import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  appendHistory,
  changeFailureRateLevel,
  computeMetrics,
  deploymentFrequencyLevel,
  leadTimeLevel,
  median,
  timeToRestoreLevel,
} from './dora-metrics.mjs';

const HOUR = 3_600_000;
const now = Date.parse('2026-11-15T12:00:00Z');
const ago = (hours) => now - hours * HOUR;

test('levels follow the DORA bands', () => {
  assert.equal(deploymentFrequencyLevel(2), 'elite');
  assert.equal(deploymentFrequencyLevel(1 / 3), 'high');
  assert.equal(deploymentFrequencyLevel(1 / 14), 'medium');
  assert.equal(deploymentFrequencyLevel(0), 'low');
  assert.equal(leadTimeLevel(3), 'elite');
  assert.equal(leadTimeLevel(48), 'high');
  assert.equal(leadTimeLevel(24 * 10), 'medium');
  assert.equal(leadTimeLevel(24 * 60), 'low');
  assert.equal(leadTimeLevel(null), null);
  assert.equal(changeFailureRateLevel(0), 'elite');
  assert.equal(changeFailureRateLevel(8), 'high');
  assert.equal(changeFailureRateLevel(12), 'medium');
  assert.equal(changeFailureRateLevel(40), 'low');
  assert.equal(timeToRestoreLevel(0.5), 'elite');
  assert.equal(timeToRestoreLevel(5), 'high');
  assert.equal(timeToRestoreLevel(48), 'medium');
  assert.equal(timeToRestoreLevel(24 * 9), 'low');
  assert.equal(timeToRestoreLevel(null), null);
});

test('median handles odd, even and empty lists', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 3, 2]), 2.5);
  assert.equal(median([]), null);
});

test('computes the four keys inside the window only', () => {
  const changes = [
    { title: 'feat: a', firstCommitAt: ago(30), mergedAt: ago(26) },
    { title: 'fix: b', firstCommitAt: ago(12), mergedAt: ago(10) },
    { title: 'Revert "feat: a"', firstCommitAt: ago(5), mergedAt: ago(4) },
    { title: 'old', firstCommitAt: ago(24 * 40), mergedAt: ago(24 * 35) },
  ];
  const metrics = computeMetrics({
    changes,
    deployments: changes.map((c) => ({ at: c.mergedAt })),
    incidents: [
      { openedAt: ago(20), closedAt: ago(18) },
      { openedAt: ago(3), closedAt: null },
    ],
    now,
    days: 30,
  });

  assert.equal(metrics.deploymentFrequency.total, 3);
  assert.equal(metrics.deploymentFrequency.perWeek, 0.7);
  assert.equal(metrics.deploymentFrequency.level, 'medium');
  assert.equal(metrics.leadTime.medianHours, 2);
  assert.equal(metrics.leadTime.changes, 3);
  assert.equal(metrics.leadTime.level, 'elite');
  assert.equal(metrics.changeFailureRate.failures, 3);
  assert.equal(metrics.changeFailureRate.percent, 100);
  assert.equal(metrics.changeFailureRate.level, 'low');
  assert.equal(metrics.timeToRestore.medianHours, 2);
  assert.equal(metrics.timeToRestore.incidents, 2);
  assert.equal(metrics.timeToRestore.open, 1);
  assert.equal(metrics.timeToRestore.level, 'high');
});

test('a quiet month has no rates to report', () => {
  const metrics = computeMetrics({ changes: [], deployments: [], incidents: [], now, days: 30 });

  assert.equal(metrics.deploymentFrequency.level, 'low');
  assert.equal(metrics.leadTime.medianHours, null);
  assert.equal(metrics.changeFailureRate.percent, null);
  assert.equal(metrics.timeToRestore.level, null);
});

test('history keeps one snapshot per day in date order', () => {
  const metrics = computeMetrics({ changes: [], deployments: [], incidents: [], now, days: 30 });
  let history = appendHistory([], '2026-11-08', metrics);
  history = appendHistory(history, '2026-11-15', metrics);
  history = appendHistory(history, '2026-11-15', metrics);

  assert.deepEqual(
    history.map((h) => h.date),
    ['2026-11-08', '2026-11-15'],
  );
});
