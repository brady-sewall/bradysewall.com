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

Theme defaults to the visitor's system preference. Light/dark overrides use local storage with a graceful fallback when storage is unavailable. System clears the saved override and follows future system changes through CSS. Theme controls require no permission prompt. Images and fonts are local. GA4 uses a US regional default with browser privacy signals and visitor opt-outs taking precedence; local previews never load analytics.

The systems illustration gently pulses for two two-second cycles, then stops (four seconds total). Cards reveal once as they enter the viewport. Reduced-motion preference disables animations, reveals, transitions, and smooth scrolling. Content remains visible without JavaScript.

The contact link opens the visitor's email application. It does not submit a form. `me@bradysewall.com` comes from Brady's historical correspondence; confirm that this mailbox is still monitored before launch.

Person and FAQPage structured data match visible content. Structured data does not guarantee enhanced search results. Domain metadata, a social card, robots.txt, and a sitemap are included.

The brand section shows 20 real or reconstructed artwork tiles in alphabetical order. Each has a tuned optical size within an identical cell. Freespira uses Brady’s supplied PNG; Lathian Systems uses historical artwork from his reference, cropped through an SVG viewBox. UPRD is an approximate custom vector recreation based on an archived print ad, as requested. Lotus has no visible caption; its accessible alternative still identifies the dealership relationship. Text-only entries and the additional client list were removed. Novasys/Renessa is omitted pending reliable artwork. See `review/logo-sources.json` for provenance. Private Gmail and mounted-drive research stays outside the repository.

## Accessibility verification

The page targets WCAG 2.2 AA. Improvements include keyboard-visible focus, a working skip link, native FAQ controls, descriptive image alternatives, 44px primary interactive targets, strengthened control borders, and reflow when text spacing is increased. Existing reduced-motion and no-JavaScript content support remain in place. See `review/accessibility.html` for the dated audit, manual checks, and limitations. Automated checks do not establish full conformance or legal compliance; a complete assistive-technology review and production retest remain advisable before launch.

The header uses a quiet theme icon with native System/Light/Dark options and a 44px target. Keyboard focus uses a high-contrast neutral outline. ATEN now uses official high-resolution artwork; UC Irvine and Laser Esthetica use official website artwork. Rock-It Science was removed at Brady’s request.

Live-site refinements: twenty logos use complete four-, two-, or one-column rows. WomanSage removed and Lotus enlarged. The hero pulse loops with a pause/resume control and respects reduced motion. LinkedIn opens in a new tab with an accessible notice.


## Privacy and analytics

- Footer links point to `docs/privacy.html` and `docs/accessibility.html`, with client trademark attribution and a blue LinkedIn icon.
- `docs/consent.js` enables GA4 automatically only when the same-origin Cloudflare `/cdn-cgi/trace` returns a US country estimate and matching hostname. The trace/IP is never stored or forwarded. A three-second timeout, failed request, missing proxy, unknown/non-US region, GPC/DNT, or saved opt-out leaves analytics off. IP geolocation is an estimate, not proof of residency.
- No automatic consent panel appears. The footer's Privacy choices control allows a visitor to enable or disable analytics. Explicit choices expire after 180 days; unavailable storage supports per-visit choices. A choice made while region lookup is pending takes precedence.
- GTM container `GTM-564FG55` already includes GA4 `G-5J759DPK0N` (property 270183853). Do not install GA4 twice. Custom events can be pushed to `dataLayer` and mapped in GTM.
- Clarity is removed. Do not add session replay or advertising tags to this container without revisiting this implementation and the privacy policy.
- Advertising consent stays denied. Global tag settings disable Google Signals and ad personalization and enable ad-data redaction before GTM loads. Review the Google tag's GTM configuration for overrides and turn off Google Signals/advertising integrations in the GA4 account. Remove the obsolete Universal Analytics tag currently present in the published container.
- Opting out disables GA4, sends denied analytics consent, clears first-party analytics cookies where possible, and reloads to end vendor runtimes. It does not erase historical vendor data or other-domain cookies.
- After deployment verify a US visit in GA4 Realtime, no scripts on opted-out/GPC visits, and no automatic tracking on non-US/unknown-country visits. Account-level settings and actual ingestion cannot be confirmed from a local preview.

Checks: `node tools/check-consent.cjs` and `node tools/check-theme.cjs`.

Consent UI refinement: a compact bottom panel replaces the notice above the hero. Its height reserves page space and scroll margins so footer keyboard focus stays visible. The hero pause/resume control uses labeled pause/play SVG icons with a 44px target. Opt-in rules remain unchanged; regional rules are not implemented.

CSS and JavaScript references use content-hash query versions to avoid mixing old browser/CDN assets with freshly deployed HTML. When changing an asset, update its `?v=` hash in each HTML page that references it.
