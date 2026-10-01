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

The default branch is `master`. The publishing source is **Settings → Pages → Deploy from a branch → master → /docs**. `.nojekyll` disables Jekyll processing. No Tailwind build is required by the new landing page. The repository contains the current site and its maintenance tools; the legacy backup site, weather page, and Tailwind build setup have been removed.

Set the custom domain to `bradysewall.com` in Pages settings. `docs/CNAME` already contains that domain. Verify domain ownership in the account's Pages settings before making DNS changes. At the DNS provider, the apex domain should use an ALIAS/ANAME to `brady-sewall.github.io`, or these four A records:

- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

For `www`, use a CNAME to `brady-sewall.github.io` (without a repository path). After DNS and certificate provisioning complete, enable Enforce HTTPS. Preserve existing email MX/TXT records. Verify both apex and www URLs, redirects, HTTPS, and static assets after deployment.

This repository is public, and the site is live at https://bradysewall.com/ with Enforce HTTPS enabled. The `master` branch requires pull requests, blocks force pushes and deletion, and applies those protections to administrators. Reviewer approvals and pre-merge deployment checks are not required for the solo-owner workflow.

Official setup references:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Behavior and content

Theme defaults to the visitor's system preference. Light/dark overrides use local storage with a graceful fallback when storage is unavailable. System clears the saved override and follows future system changes through CSS. Theme controls require no permission prompt. Images and fonts are local. GA4 uses a US regional default with browser privacy signals and visitor opt-outs taking precedence; local previews never load analytics.

The systems illustration pulses continuously, with an accessible pause/resume control. Cards reveal once as they enter the viewport. Reduced-motion preference disables animations, reveals, transitions, and smooth scrolling. Content remains visible without JavaScript.

The contact link opens the visitor's email application. It does not submit a form. The contact address is `hello@bradysewall.com`.

Person and FAQPage structured data match visible content. Structured data does not guarantee enhanced search results. Domain metadata, a social card, robots.txt, and a sitemap are included.

The brand section shows 19 real or reconstructed artwork tiles in alphabetical order. Each has a tuned optical size within an identical cell. Freespira uses Brady’s supplied PNG; Lathian Systems uses historical artwork from his reference, cropped through an SVG viewBox. UPRD is an approximate custom vector recreation based on an archived print ad, as requested. Lotus has no visible caption; its accessible alternative still identifies the dealership relationship. Text-only entries and the additional client list were removed. Novasys/Renessa is omitted pending reliable artwork. See `review/logo-sources.json` for provenance.

## Accessibility verification

The page targets WCAG 2.2 AA. Improvements include keyboard-visible focus, a working skip link, native FAQ controls, descriptive image alternatives, 44px primary interactive targets, strengthened control borders, and reflow when text spacing is increased. Existing reduced-motion and no-JavaScript content support remain in place. See `review/accessibility.html` for the dated audit, manual checks, and limitations. Automated checks do not establish full conformance or legal compliance; a complete assistive-technology review remains outstanding, and material changes should be retested.

The header uses a quiet theme icon with native System/Light/Dark options and a 44px target. Keyboard focus uses a high-contrast neutral outline. ATEN now uses official high-resolution artwork; UC Irvine and Laser Esthetica use official website artwork. Rock-It Science was removed at Brady’s request.

The logo layout uses four, two, or one column depending on screen width, with partial rows centered. Lotus has an enlarged optical size. The hero pulse loops with a pause/resume control and respects reduced motion. LinkedIn opens in a new tab with an accessible notice.


## Privacy and analytics

- Footer links point to `docs/privacy.html` and `docs/accessibility.html`, with client trademark attribution and a blue LinkedIn icon.
- `docs/consent.js` enables GA4 automatically only when the same-origin Cloudflare `/cdn-cgi/trace` returns a US country estimate and matching hostname. The trace/IP is never stored or forwarded. A three-second timeout, failed request, missing proxy, unknown/non-US region, GPC/DNT, or saved opt-out leaves analytics off. IP geolocation is an estimate, not proof of residency.
- No automatic consent panel appears. The footer's Privacy choices control allows a visitor to enable or disable analytics. Explicit choices expire after 180 days; unavailable storage supports per-visit choices. A choice made while region lookup is pending takes precedence.
- GTM container `GTM-564FG55` already includes GA4 `G-5J759DPK0N` (property 270183853). Do not install GA4 twice. Custom events can be pushed to `dataLayer` and mapped in GTM.
- Clarity is removed. Do not add session replay or advertising tags to this container without revisiting this implementation and the privacy policy.
- Advertising consent stays denied. Global tag settings disable Google Signals and ad personalization and enable ad-data redaction before GTM loads. Google Signals and ad personalization were disabled in GA4, and the obsolete Universal Analytics tag was removed and published in GTM. Review these settings again if the container or account configuration changes.
- Opting out disables GA4, sends denied analytics consent, clears first-party analytics cookies where possible, and reloads to end vendor runtimes. It does not erase historical vendor data or other-domain cookies.
- After deployment verify a US visit in GA4 Realtime, no scripts on opted-out/GPC visits, and no automatic tracking on non-US/unknown-country visits. Account-level settings and actual ingestion cannot be confirmed from a local preview.

Checks: `node tools/check-consent.cjs` and `node tools/check-theme.cjs`.

Consent UI refinement: a compact bottom panel replaces the notice above the hero. Its height reserves page space and scroll margins so footer keyboard focus stays visible. The hero pause/resume control uses labeled pause/play SVG icons with a 44px target. The regional analytics rules described above apply.

CSS and JavaScript references use content-hash query versions to avoid mixing old browser/CDN assets with freshly deployed HTML. When changing an asset, update its `?v=` hash in each HTML page that references it.

## IndexNow

After a successful `pages-build-deployment` run on `master`, the IndexNow notifications workflow checks the live ownership file and submits the three canonical URLs from the live sitemap to participating search engines. It can also be run manually from Actions → IndexNow notifications → Run workflow. No browser script, cookies, paid service, or account token is required. The public `docs/indexnow-key.txt` is a domain verification file, not a private credential.

Validate without submitting: `python3 tools/submit-indexnow.py --dry-run`. To submit manually after deployment: `python3 tools/submit-indexnow.py`. A 200 response means received; 202 means received with key validation pending. Neither guarantees indexing. If the live key check fails, wait for Pages/CDN propagation and rerun. This supplements the sitemap and Search Console; it does not replace them. See https://www.indexnow.org/documentation.

## Repository layout

- `docs/`: the three published pages, their assets, search files, and domain configuration.
- `tools/`: theme and consent checks, plus IndexNow submission.
- `.github/workflows/`: deployment follow-up notifications.
- `review/`: logo provenance and the dated accessibility audit.

`docs/LICENSE` preserves the original template attribution. `images/social-card.svg` is the editable preview source; `images/social-card.png` remains as a compatibility URL for previously shared previews.
