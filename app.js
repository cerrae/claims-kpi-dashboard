const money = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

let claims = [];

async function init() {
  const res = await fetch('data.json');
  claims = await res.json();

  document.getElementById('report-range').textContent = reportRange(claims);

  renderKPIs(claims);
  renderAgingChart(claims);
  renderRejectionChart(claims);
  populatePayerFilter(claims);
  renderTable(claims);

  document.getElementById('statusFilter').addEventListener('change', applyFilters);
  document.getElementById('payerFilter').addEventListener('change', applyFilters);
}

function reportRange(data) {
  const dates = data.map(c => new Date(c.submitted)).sort((a, b) => a - b);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
}

function renderKPIs(data) {
  const open = data.filter(c => c.status === 'Pending' || c.status === 'Appealed');
  const totalAR = open.reduce((sum, c) => sum + c.amount, 0);
  const rejected = data.filter(c => c.status === 'Rejected').length;
  const rejectionRate = (rejected / data.length) * 100;
  const avgDays = open.length
    ? open.reduce((sum, c) => sum + c.days_outstanding, 0) / open.length
    : 0;

  document.getElementById('kpi-total-ar').textContent = money(totalAR);
  document.getElementById('kpi-rejection-rate').textContent = `${rejectionRate.toFixed(1)}%`;
  document.getElementById('kpi-avg-days').textContent = Math.round(avgDays);
  document.getElementById('kpi-open-cases').textContent = open.length;
}

function agingBucket(days) {
  if (days <= 30) return '0–30';
  if (days <= 60) return '31–60';
  if (days <= 90) return '61–90';
  return '90+';
}

function renderAgingChart(data) {
  const open = data.filter(c => c.status === 'Pending' || c.status === 'Appealed');
  const buckets = { '0–30': 0, '31–60': 0, '61–90': 0, '90+': 0 };
  open.forEach(c => { buckets[agingBucket(c.days_outstanding)] += c.amount; });

  new Chart(document.getElementById('agingChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(buckets),
      datasets: [{
        label: 'Outstanding A/R',
        data: Object.values(buckets),
        backgroundColor: ['#2F6F4E', '#B9852E', '#B9852E', '#9B2C2C'],
        borderRadius: 3,
        maxBarThickness: 56,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: (v) => money(v) }, grid: { color: '#E3E7EC' } },
        x: { grid: { display: false } },
      },
    },
  });
}

function renderRejectionChart(data) {
  const byMonth = {};
  data.forEach(c => {
    const d = new Date(c.submitted);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = byMonth[key] || { total: 0, rejected: 0 };
    byMonth[key].total += 1;
    if (c.status === 'Rejected') byMonth[key].rejected += 1;
  });

  const months = Object.keys(byMonth).sort();
  const rates = months.map(m => (byMonth[m].rejected / byMonth[m].total) * 100);
  const labels = months.map(m => {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleDateString('en-US', { month: 'short' });
  });

  new Chart(document.getElementById('rejectionChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Rejection rate',
        data: rates,
        borderColor: '#9B2C2C',
        backgroundColor: 'rgba(155,44,44,0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: (v) => `${v}%` }, grid: { color: '#E3E7EC' } },
        x: { grid: { display: false } },
      },
    },
  });
}

function populatePayerFilter(data) {
  const payers = [...new Set(data.map(c => c.payer))].sort();
  const select = document.getElementById('payerFilter');
  payers.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });
}

function renderTable(data) {
  const body = document.getElementById('claimsBody');
  body.innerHTML = '';
  data
    .slice()
    .sort((a, b) => new Date(b.submitted) - new Date(a.submitted))
    .forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.payer}</td>
        <td>${new Date(c.submitted).toLocaleDateString('en-US')}</td>
        <td class="amount">${money(c.amount)}</td>
        <td class="days">${c.days_outstanding}</td>
        <td><span class="status-pill status-${c.status}">${c.status}</span></td>
      `;
      body.appendChild(tr);
    });
}

function applyFilters() {
  const status = document.getElementById('statusFilter').value;
  const payer = document.getElementById('payerFilter').value;
  const filtered = claims.filter(c =>
    (status === 'all' || c.status === status) &&
    (payer === 'all' || c.payer === payer)
  );
  renderTable(filtered);
}

init();
