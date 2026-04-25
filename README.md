# Nexa AI — Landing Site

A single-page static landing site. No build step, no framework.

## Stack

- HTML, CSS, vanilla JS.
- Google Fonts (Playfair Display + Inter), loaded over the network.
- Form submits to an n8n webhook running on Render.

## Local development

```bash
python3 -m http.server 5173
# then open http://localhost:5173
```

Any static file server will do.

## Files

```
index.html                  # markup
styles.css                  # all styles
script.js                   # nav state, reveal animations, form submit
render.yaml                 # Render Static Site config
robots.txt                  # search engine policy
nexa-logo-transparent.png   # logo used in nav + favicon
nexa-logo-dark.png          # used as social/OG image
nexa-logo-light.png         # alternate variant
```

## Form / webhook

The contact form POSTs `application/x-www-form-urlencoded` to an n8n webhook in `mode: 'no-cors'`.

- URL is set in `script.js` as `WEBHOOK_URL`.
- Payload fields: `name`, `email`, `business-type`, `need-help-with`.
- The n8n Webhook node must be **POST** and the workflow **Active**.
- In n8n nodes, reference fields as `$('Webhook').item.json.body["name"]` etc.

### Once you're on a real domain

1. In `script.js`, drop `mode: 'no-cors'` so you can detect failures properly.
2. On the n8n side (Render), set:
   ```
   N8N_CORS_ALLOW_ORIGIN=https://your-domain.com
   ```
   and / or set "Allowed Origins (CORS)" on the Webhook node to the same.

## Deploy to Render (Static Site)

This repo includes a `render.yaml` that defines the site. Two ways to deploy:

### Option A — Blueprint (one click after first push)

1. Push this folder to a Git repo (GitHub / GitLab / Bitbucket).
2. In Render: **New +** → **Blueprint** → connect the repo.
3. Render reads `render.yaml` and creates the static site.
4. After it's live, in the service settings add a **custom domain** if you have one.

### Option B — Manual

1. Push to a Git repo.
2. In Render: **New +** → **Static Site** → connect the repo.
3. Settings:
   - **Build Command:** *(leave empty)*
   - **Publish Directory:** `.`
4. Deploy.

## Notes

- The site is fully static — no env vars, no secrets in the build.
- The webhook URL is a public-facing endpoint by design (n8n webhook). If you want to hide it, route through your own backend.
- Render free tier sleeps the n8n service after 15 min of inactivity; first form submit after sleep may stall briefly while it wakes.
