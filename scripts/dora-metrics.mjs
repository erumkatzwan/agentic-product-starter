#!/usr/bin/env node
/**
 * DORA metrics from GitHub data (ADR-0010): deployment frequency, lead time for changes,
 * change failure rate and time to restore service.
 *
 *   node scripts/dora-metrics.mjs --repo owner/name [--days 30] [--history dora.json] [--out dora.json]
 *
 * Needs GITHUB_TOKEN (read access to pull requests, issues and actions).
 * A deployment is a pull request merged into main, unless DEPLOY_WORKFLOWS lists workflow files
 * (for example "deploy-prod.yml"): then every successful run of those on main counts instead.
 * A failure is an issue labelled `incident`, or a merged pull request whose title starts with "Revert".
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

// Performance levels from the DORA State of DevOps reports. Lower is better except deployment frequency.
export const LEVELS = ['elite', 'high', 'medium', 'low'];

export function deploymentFrequencyLevel(perDay) {
  if (perDay >= 1) return 'elite'; // on demand, several times a day
  if (perDay >= 1 / 7) return 'high'; // between once a day and once a week
  if (perDay >= 1 / 30) return 'medium'; // between once a week and once a month
  return 'low';
}

export function leadTimeLevel(hours) {
  if (hours == null) return null;
  if (hours < 24) return 'elite';
  if (hours < 24 * 7) return 'high';
  if (hours < 24 * 30) return 'medium';
  return 'low';
}

export function changeFailureRateLevel(percent) {
  if (percent == null) return null;
  if (percent <= 5) return 'elite';
  if (percent <= 10) return 'high';
  if (percent <= 15) return 'medium';
  return 'low';
}

export function timeToRestoreLevel(hours) {
  if (hours == null) return null;
  if (hours < 1) return 'elite';
  if (hours < 24) return 'high';
  if (hours < 24 * 7) return 'medium';
  return 'low';
}

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

const round = (value, digits = 1) => (value == null ? null : Math.round(value * 10 ** digits) / 10 ** digits);

/**
 * Pure calculation, so it can be tested without GitHub.
 * changes: [{ firstCommitAt, mergedAt, title }]  deployments: [{ at }]  incidents: [{ openedAt, closedAt|null }]
 */
export function computeMetrics({ changes, deployments, incidents, now, days }) {
  const since = now - days * DAY;
  const inWindow = (time) => time >= since && time <= now;
  const merged = changes.filter((c) => inWindow(c.mergedAt));
  const deployed = deployments.filter((d) => inWindow(d.at));
  const opened = incidents.filter((i) => inWindow(i.openedAt));
  const reverts = merged.filter((c) => /^revert\b/i.test(c.title));

  const perDay = deployed.length / days;
  const leadHours = median(merged.map((c) => (c.mergedAt - c.firstCommitAt) / HOUR).filter((h) => h >= 0));
  const failures = opened.length + reverts.length;
  const failurePercent = deployed.length ? (100 * failures) / deployed.length : null;
  const restoreHours = median(opened.filter((i) => i.closedAt).map((i) => (i.closedAt - i.openedAt) / HOUR));

  return {
    deploymentFrequency: { total: deployed.length, perWeek: round(perDay * 7), level: deploymentFrequencyLevel(perDay) },
    leadTime: { medianHours: round(leadHours), changes: merged.length, level: leadTimeLevel(leadHours) },
    changeFailureRate: {
      percent: round(failurePercent),
      failures,
      deployments: deployed.length,
      level: changeFailureRateLevel(failurePercent),
    },
    timeToRestore: {
      medianHours: round(restoreHours),
      incidents: opened.length,
      open: opened.filter((i) => !i.closedAt).length,
      level: timeToRestoreLevel(restoreHours),
    },
  };
}

/** Keeps one snapshot per day, newest last, at most a year of them. */
export function appendHistory(history, date, metrics) {
  const snapshot = {
    date,
    deploymentsPerWeek: metrics.deploymentFrequency.perWeek,
    leadTimeHours: metrics.leadTime.medianHours,
    changeFailurePercent: metrics.changeFailureRate.percent,
    timeToRestoreHours: metrics.timeToRestore.medianHours,
  };
  return [...history.filter((h) => h.date !== date), snapshot].sort((a, b) => a.date.localeCompare(b.date)).slice(-366);
}

async function github(path, token) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  });
  if (!response.ok) throw new Error(`GitHub ${response.status} for ${path}`);
  return response.json();
}

async function collect(repo, token, since, deployWorkflows) {
  const changes = [];
  for (let page = 1; page <= 10; page++) {
    const pulls = await github(`/repos/${repo}/pulls?state=closed&base=main&sort=updated&direction=desc&per_page=100&page=${page}`, token);
    for (const pull of pulls.filter((p) => p.merged_at && Date.parse(p.merged_at) >= since)) {
      const commits = await github(`/repos/${repo}/pulls/${pull.number}/commits?per_page=100`, token);
      const first = Math.min(...commits.map((c) => Date.parse(c.commit.author?.date ?? c.commit.committer.date)));
      changes.push({ number: pull.number, title: pull.title, mergedAt: Date.parse(pull.merged_at), firstCommitAt: first });
    }
    if (pulls.length < 100 || Date.parse(pulls.at(-1).updated_at) < since) break;
  }

  let deployments = changes.map((c) => ({ at: c.mergedAt }));
  if (deployWorkflows.length) {
    deployments = [];
    const created = new Date(since).toISOString().slice(0, 10);
    for (const workflow of deployWorkflows) {
      const runs = await github(`/repos/${repo}/actions/workflows/${workflow}/runs?branch=main&status=success&per_page=100&created=%3E%3D${created}`, token);
      deployments.push(...runs.workflow_runs.map((run) => ({ at: Date.parse(run.updated_at) })));
    }
  }

  const issues = await github(`/repos/${repo}/issues?labels=incident&state=all&per_page=100&since=${new Date(since).toISOString()}`, token);
  const incidents = issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({ openedAt: Date.parse(issue.created_at), closedAt: issue.closed_at ? Date.parse(issue.closed_at) : null }));

  return { changes, deployments, incidents };
}

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : fallback;
}

async function main() {
  const repo = argument('repo', process.env.GITHUB_REPOSITORY);
  const token = process.env.GITHUB_TOKEN;
  const days = Number(argument('days', '30'));
  const historyFile = argument('history');
  const out = argument('out');
  if (!repo || !token) throw new Error('Set --repo owner/name (or GITHUB_REPOSITORY) and GITHUB_TOKEN.');

  const now = Date.now();
  const deployWorkflows = (process.env.DEPLOY_WORKFLOWS ?? '').split(/[\s,]+/).filter(Boolean);
  const data = await collect(repo, token, now - days * DAY, deployWorkflows);
  const metrics = computeMetrics({ ...data, now, days });
  const previous = historyFile && existsSync(historyFile) ? JSON.parse(readFileSync(historyFile, 'utf8')) : {};
  const result = {
    repository: repo,
    generatedAt: new Date(now).toISOString(),
    windowDays: days,
    deploymentSource: deployWorkflows.length ? `successful runs of ${deployWorkflows.join(', ')}` : 'pull requests merged into main',
    metrics,
    history: appendHistory(previous.history ?? [], new Date(now).toISOString().slice(0, 10), metrics),
  };

  const json = `${JSON.stringify(result, null, 2)}\n`;
  if (out) writeFileSync(out, json);
  const m = metrics;
  console.log(`DORA metrics for ${repo}, last ${days} days (deployments: ${result.deploymentSource})`);
  console.log(`  Deployment frequency   ${m.deploymentFrequency.perWeek}/week (${m.deploymentFrequency.total})  ${m.deploymentFrequency.level}`);
  console.log(`  Lead time for changes  ${m.leadTime.medianHours ?? '-'} h median  ${m.leadTime.level ?? '-'}`);
  console.log(`  Change failure rate    ${m.changeFailureRate.percent ?? '-'} %  ${m.changeFailureRate.level ?? '-'}`);
  console.log(`  Time to restore        ${m.timeToRestore.medianHours ?? '-'} h median  ${m.timeToRestore.level ?? '-'}`);
  if (!out) process.stdout.write(json);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
