// Renders the DORA dashboard from dora.json (published to the `metrics` branch by .github/workflows/dora.yml).
// Add ?data=<url> to the address to preview another file.
(function () {
  const root = document.getElementById('dora');
  const status = document.getElementById('dora-status');
  const grid = document.getElementById('dora-metrics');
  const source = new URLSearchParams(location.search).get('data') || root.dataset.source;

  const levelText = { elite: 'Elite', high: 'High', medium: 'Medium', low: 'Low' };

  function hours(value) {
    if (value == null) return '–';
    if (value < 1) return `${Math.round(value * 60)} min`;
    if (value < 48) return `${value} h`;
    return `${Math.round((value / 24) * 10) / 10} days`;
  }

  const keys = [
    {
      id: 'deployment-frequency',
      name: 'Deployment frequency',
      metric: (m) => m.deploymentFrequency,
      value: (k) => `${k.perWeek} / week`,
      detail: (k) => `${k.total} deployments`,
      trend: 'deploymentsPerWeek',
      higherIsBetter: true,
    },
    {
      id: 'lead-time',
      name: 'Lead time for changes',
      metric: (m) => m.leadTime,
      value: (k) => hours(k.medianHours),
      detail: (k) => `median of ${k.changes} changes`,
      trend: 'leadTimeHours',
    },
    {
      id: 'change-failure-rate',
      name: 'Change failure rate',
      metric: (m) => m.changeFailureRate,
      value: (k) => (k.percent == null ? '–' : `${k.percent} %`),
      detail: (k) => `${k.failures} of ${k.deployments} deployments`,
      trend: 'changeFailurePercent',
    },
    {
      id: 'time-to-restore',
      name: 'Time to restore service',
      metric: (m) => m.timeToRestore,
      value: (k) => (k.incidents ? hours(k.medianHours) : 'No incidents'),
      detail: (k) => (k.open ? `${k.open} incident(s) still open` : `${k.incidents} incident(s)`),
      trend: 'timeToRestoreHours',
    },
  ];

  function sparkline(points) {
    const values = points.filter((v) => v != null);
    if (values.length < 2) return '';
    const max = Math.max(...values) || 1;
    const step = 100 / (points.length - 1);
    const path = points
      .map((v, i) => (v == null ? null : `${(i * step).toFixed(1)},${(28 - (v / max) * 26).toFixed(1)}`))
      .filter(Boolean)
      .join(' ');
    return `<svg class="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="${path}"/></svg>`;
  }

  function card(key, data) {
    const k = key.metric(data.metrics);
    const level = k.level ? `<span class="level level--${k.level}">${levelText[k.level]}</span>` : '<span class="level">Not enough data</span>';
    const trend = sparkline(data.history.slice(-12).map((h) => h[key.trend]));
    return `<article class="card metric" id="${key.id}">
      <h3>${key.name}</h3>
      <p class="metric__value">${key.value(k)}</p>
      ${level}
      <p class="muted">${key.detail(k)}</p>
      ${trend}
    </article>`;
  }

  fetch(source, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then((data) => {
      grid.innerHTML = keys.map((key) => card(key, data)).join('');
      const updated = new Date(data.generatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' });
      status.textContent = `Last ${data.windowDays} days, updated ${updated}. Deployments: ${data.deploymentSource}.`;
    })
    .catch(() => {
      status.textContent = 'No numbers yet. They appear after the DORA metrics workflow has run once.';
    });
})();
