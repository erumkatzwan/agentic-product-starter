// Renders the security dashboard from security.json (published to the `security` branch by .github/workflows/security.yml).
// Add ?data=<url> to the address to preview another file.
(function () {
  const root = document.getElementById('security');
  const status = document.getElementById('security-status');
  const source = new URLSearchParams(location.search).get('data') || root.dataset.source;

  const LEVELS = [
    ['critical', 'Critical'],
    ['high', 'High'],
    ['medium', 'Medium'],
    ['low', 'Low'],
  ];
  const escape = (text) =>
    String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  function levelCards(counts) {
    return LEVELS.map(
      ([id, name]) => `<article class="card metric" id="level-${id}">
        <h3>${name}</h3>
        <p class="metric__value">${counts[id]}</p>
        <span class="level ${counts[id] ? `sev--${id}` : 'sev--clear'}">${counts[id] ? 'Fix needed' : 'None'}</span>
      </article>`,
    ).join('');
  }

  function appTable(apps) {
    const head = `<thead><tr><th scope="col">App</th><th scope="col">Packages</th>${LEVELS.map(([, name]) => `<th scope="col">${name}</th>`).join('')}</tr></thead>`;
    const rows = apps
      .map((a) => `<tr><th scope="row">${escape(a.app)}</th><td>${a.packages}</td>${LEVELS.map(([id]) => `<td>${a.counts[id]}</td>`).join('')}</tr>`)
      .join('');
    return `${head}<tbody>${rows}</tbody>`;
  }

  function findings(list, packages) {
    if (!list.length) return `<p>No known vulnerabilities in ${packages} packages.</p>`;
    const rows = list
      .map(
        (f) => `<tr>
          <td><span class="level sev sev--${escape(f.level)}">${escape(f.level)}</span></td>
          <td>${escape(f.app)}</td>
          <td><code>${escape(f.package)}</code> ${escape(f.version)}</td>
          <td>${f.fixed ? `${escape(f.fixed)} or later` : 'No fix yet'}</td>
          <td><a href="${escape(f.url)}">${escape(f.cve || f.id)}</a></td>
        </tr>`,
      )
      .join('');
    return `<div class="table-wrap"><table><thead><tr><th scope="col">Level</th><th scope="col">App</th><th scope="col">Package</th><th scope="col">Upgrade to</th><th scope="col">Advisory</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  fetch(source, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then((data) => {
      document.getElementById('security-levels').innerHTML = levelCards(data.counts);
      document.getElementById('security-apps').innerHTML = appTable(data.apps);
      document.getElementById('security-findings').innerHTML = findings(data.findings, data.packages);
      const scanned = new Date(data.generatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' });
      status.textContent = `${data.packages} packages scanned, last scan ${scanned}.`;
    })
    .catch(() => {
      status.textContent = 'No scan yet. Results appear after the Security workflow has run once on main.';
    });
})();
