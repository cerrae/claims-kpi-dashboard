# Claims & A/R KPI Dashboard

A revenue-cycle reporting dashboard styled after the KPI/aging reports used in dental billing and claims operations — the same kind of reporting used to track A/R, claim rejection rates, and case aging in a real coordinator role.

**[View live demo](#)** *(update this link once deployed to GitHub Pages)*

## What it shows

- **KPI strip** — outstanding A/R, rejection rate, average days outstanding, and open case count
- **A/R aging chart** — outstanding balance grouped into 0–30 / 31–60 / 61–90 / 90+ day buckets
- **Rejection rate trend** — monthly rejection rate across the reporting period
- **Filterable claims table** — filter by status and payer

## Why this project

This mirrors real KPI reporting work: tracking A/R aging, monitoring rejection rates, and surfacing case-level detail for weekly leadership review — the kind of reporting that directly supports claims workflow decisions.

## Stack

Plain HTML/CSS/JS + [Chart.js](https://www.chartjs.org/) via CDN — no build step, so it runs directly from GitHub Pages or by opening `index.html` locally.

## Data

`data.json` contains synthetic, randomly generated claims data (no real patient or payer information) across five sample payers and a 6-month window, used purely to demonstrate the reporting layer.

## Run locally

```bash
# any static file server works, e.g.:
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Repo Settings → Pages → set source to the `main` branch, root folder.
3. Site will be live at `https://<username>.github.io/<repo-name>/`.
