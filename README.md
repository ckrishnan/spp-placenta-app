# Placenta pathology reporting tool

Brought to you by the Society for pediatric pathology, placental reporting taskforce

## Deployment (GitHub Pages)

The site is a static export (`next.config.ts` uses `output: 'export'`).
[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds it and publishes
the `out/` folder to GitHub Pages on every push to `main`.

**One-time setup:** in *Settings → Pages → Build and deployment*, set **Source** to
**GitHub Actions**. (Leaving it on "Deploy from a branch" makes GitHub run Jekyll over
the repository instead, which only renders this README — it never builds the app.)

Asset paths depend on where the site is served from. The workflow passes
`NEXT_PUBLIC_BASE_PATH` from the Pages `base_path` output, so:

| Pages setup | `NEXT_PUBLIC_BASE_PATH` | Site URL |
|---|---|---|
| Custom domain | *(empty)* | `https://placenta.spponline.org/` |
| No custom domain | `/spp-placenta-app` | `https://ckrishnan.github.io/spp-placenta-app/` |

Configuring a custom domain makes GitHub **301-redirect** the `github.io` project URL to
it, so only one of the two URLs is reachable at a time.

### Custom domain (`placenta.spponline.org`)

1. At the DNS provider for `spponline.org`, add a **CNAME** record:
   `placenta` → `ckrishnan.github.io`, TTL 3600.
   On Cloudflare the record must be **DNS only (grey cloud)** until GitHub has issued the
   TLS certificate; an orange-cloud/proxied record blocks certificate provisioning.
2. In *Settings → Pages → Custom domain*, enter `placenta.spponline.org` and enable
   **Enforce HTTPS** once the certificate is ready.
3. Optionally commit a `public/CNAME` file containing `placenta.spponline.org`.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

To preview exactly what GitHub Pages serves:

```bash
npm run build        # writes out/ (static export)
npx serve out
```


