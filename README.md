# Brady Sewall — bradysewall.com

A lightweight consulting landing page. The website lives in `docs/`: plain HTML, CSS, and JavaScript, with local logo assets and no build step or runtime dependencies.

## Edit in Cursor

Open this repository folder in Cursor. Edit `docs/index.html`, `docs/styles.css`, `docs/theme.js`, and `docs/script.js`. Keep GitHub as the shared source of truth; use the same clone in Cursor and Codex.

Preview from the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```

Visit http://127.0.0.1:8765. Check desktop and mobile layouts and all three theme settings before committing. Run `node tools/check-theme.cjs` for theme behavior checks. Create a branch, push it, and review a pull request before merging into `master`.

## GitHub Pages

The existing default branch is `master`. The intended publishing source is **Settings → Pages → Deploy from a branch → master → /docs**. `.nojekyll` disables Jekyll processing. No Tailwind build is required by the new landing page. Legacy assets remain available for existing URLs; its older package/build instructions do not apply to this page.

Set the custom domain to `bradysewall.com` in Pages settings. `docs/CNAME` already contains that domain. Verify domain ownership in the account's Pages settings before making DNS changes. At the DNS provider, the apex domain should use an ALIAS/ANAME to `brady-sewall.github.io`, or these four A records:

- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

For `www`, use a CNAME to `brady-sewall.github.io` (without a repository path). After DNS and certificate provisioning complete, enable Enforce HTTPS. Preserve existing email MX/TXT records. Verify both apex and www URLs, redirects, HTTPS, and static assets after deployment.

This repository is private. GitHub Pages from a private repository requires an eligible paid GitHub plan. Check the account's plan before changing repository visibility. Pages settings, plan eligibility, DNS, and production deployment have not been verified or changed by this update.

Official setup references:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Behavior and content

Theme defaults to the visitor's system preference. Light/dark overrides use local storage with a graceful fallback when storage is unavailable. System clears the saved override and follows future system changes through CSS. There are no permission prompts, cookies, analytics, external font requests, or external image requests on the new page.

The systems illustration gently pulses for two cycles, then stops. Cards reveal once as they enter the viewport. Reduced-motion preference disables animations, reveals, transitions, and smooth scrolling. Content remains visible without JavaScript.

The contact link opens the visitor's email application. It does not submit a form. `me@bradysewall.com` comes from Brady's historical correspondence; confirm that this mailbox is still monitored before launch.

Person and FAQPage structured data match visible content. Structured data does not guarantee enhanced search results. Domain metadata, a social card, robots.txt, and a sitemap are included.

Eleven requested brands have real artwork. UPRD, historical Lathian Systems / MyDrugRep.com, and WomanSage use text labels pending reliable historical artwork. See `review/logo-sources.json` for provenance and limitations. Gmail-derived additional client candidates are deliberately not included in the page.
