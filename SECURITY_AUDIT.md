# Security & Phishing Audit Report

**Repository:** `remiclassic/remiresume`  
**Live site:** https://remiclassic.github.io/remiresume/  
**Audit date:** June 15, 2026  
**Auditor scope:** All deployed GitHub Pages assets (HTML, inline CSS/JS, images, videos)

---

## Executive Summary

This repository is a **static personal resume/portfolio site** with **no server-side code**, **no forms**, **no credential collection**, **no obfuscated JavaScript**, **no analytics/tracking scripts**, and **no cryptocurrency integrations**.

Google Safe Browsing flagged the site under **social engineering / phishing** ("pages that try to trick visitors into sharing personal information or downloading software"). After inspection, **no malicious code was found**. The warning is most likely a **false positive** caused by:

1. A **Google Docs presentation iframe** embedded on a non-Google domain (classic phishing pattern)
2. **Misleading "Download PDF" buttons** that used a download icon but only triggered `window.print()`
3. **Prominent personal contact information** (phone, email) on the homepage
4. **Portfolio imagery** depicting game UIs, consoles, and menu screens that automated classifiers may confuse with login/account interfaces

Fixes were applied to remove the highest-risk patterns while preserving normal portfolio functionality.

---

## Files Scanned

| Category | Files | Notes |
|----------|-------|-------|
| HTML | `index.html`, `portfolio.html` | Only web pages in the deployed repo |
| CSS | Inline in both HTML files | No external `.css` files |
| JavaScript | Inline in both HTML files | No external `.js` files |
| JSON / YAML / TOML | **None tracked in git** | No `package.json`, `_config.yml`, GitHub Actions, etc. |
| Configuration | **None** | No `.github/workflows`, no `CNAME`, no `robots.txt` |

**Not deployed (untracked locally):** `slides/extracted/` (PowerPoint XML), PDFs, `.pptx`, shortcut files — these are **not** served by GitHub Pages unless committed.

**Git-tracked deploy surface:** 2 HTML files, 2 photos, 103 portfolio images, 9 MP4 videos.

---

## Findings

### Critical / High Risk

| # | File | Lines | Finding | Why it may trigger Safe Browsing | Risk | Status |
|---|------|-------|---------|----------------------------------|------|--------|
| H1 | `portfolio.html` | 1310 (original) | `<iframe src="https://docs.google.com/presentation/.../embed">` | Embedding Google Docs/Slides on a third-party domain is a **well-known phishing technique**. Crawlers see Google-branded UI inside a non-Google origin and may classify the page as a credential-harvesting wrapper. The embed can also load dynamic Google sign-in prompts. | **High** | **FIXED** — iframe removed; replaced with explicit external link |
| H2 | `index.html` | 43–73, 851–865 (original) | Buttons labeled **"Download PDF"** with a **down-arrow download icon**, calling `window.print()` | Safe Browsing warning explicitly mentions **"downloading software"**. A download-styled CTA that does not actually download a file is a **misleading call to action** — a known social-engineering signal. | **High** | **FIXED** — renamed to **"Print Resume"** with printer icon |

### Medium Risk

| # | File | Lines | Finding | Why it may trigger Safe Browsing | Risk | Status |
|---|------|-------|---------|----------------------------------|------|--------|
| M1 | `index.html` | 829–836 | `tel:` and `mailto:` links with phone number and Gmail address displayed in header | Warning text includes **"sharing personal information"**. While normal for a resume, prominent PII can contribute to classifier scores when combined with other signals. | **Medium** | **Kept** (legitimate resume contact info) |
| M2 | `portfolio.html` | 824–958, 983–1280 | Game UI portfolio images/videos (main menus, diagnostic consoles, inventory screens, faction selectors) | Visual ML models may interpret HUD/console/menu artwork as **fake login or account screens**, especially sci-fi diagnostic UIs and multiplayer menu concepts. | **Medium** | **Kept** (core portfolio content) |
| M3 | `portfolio.html` | 1314–1332 | CTA slide: "Let's Build Something Together" + "Connect on LinkedIn" | Legitimate contact CTA. Could marginally resemble engagement-bait patterns when combined with PII elsewhere. | **Low–Medium** | **Kept** (standard portfolio CTA) |
| M4 | `portfolio.html` | 970–976, 1413 | YouTube links + hotlinked thumbnails from `img.youtube.com` | External content references. YouTube is trusted; risk is low but adds third-party dependency. | **Low–Medium** | **Kept**; `rel="noopener noreferrer"` added |

### Low Risk

| # | File | Lines | Finding | Why it may trigger Safe Browsing | Risk | Status |
|---|------|-------|---------|----------------------------------|------|--------|
| L1 | `index.html`, `portfolio.html` | 7–9 | Google Fonts loaded from `fonts.googleapis.com` / `fonts.gstatic.com` | External stylesheet request. Trusted CDN; no executable JS from Google Fonts CSS. | **Low** | **Kept** |
| L2 | `portfolio.html` | 84–95, 1577–1588 | Slides hidden via `opacity: 0` / `pointer-events: none`; JS injects `<img>` elements | Normal slideshow lazy-loading pattern. **Not** deceptive cloaking — all content is visible when navigating slides. | **Low** | **Kept** |
| L3 | `index.html` | 837 (original) | LinkedIn link opened with `target="_blank"` but **without** `rel="noopener noreferrer"` | Tab-nabbing security issue, not a phishing trigger. | **Low** | **FIXED** |
| L4 | `index.html` | 875 (original) | Portfolio link used `target="_blank"` for same-origin page | Unnecessary new-tab behavior; minor UX/security concern. | **Low** | **FIXED** — same-tab navigation |
| L5 | Both HTML files | — | No `<meta name="description">`, no referrer policy | Missing metadata reduces crawler context for legitimate classification. | **Low** | **FIXED** |
| L6 | `portfolio.html` | 1555–1739 | Inline JS: slideshow navigation, lazy loading, touch swipe | Readable, non-obfuscated, no `eval()`, no `fetch()`, no DOM injection of scripts. | **Low** (clean) | No change needed |
| L7 | `index.html` | 1185–1198 | Inline JS: scroll-to-top button visibility | Minimal, benign. | **Low** (clean) | No change needed |

### Not Found (Verified Absent)

The following phishing/malware indicators were **searched for and not present** in deployed files:

- `<form>` elements
- `type="password"` / `type="email"` inputs
- Login / sign-in / sign-up UI copy
- `eval()`, `Function()`, `atob()`, `fromCharCode()`, obfuscated strings
- `document.write`, dangerous `innerHTML` assignment
- Analytics (`gtag`, GA, GTM), Facebook Pixel, fingerprinting (`navigator.userAgent` collection)
- URL shorteners (`bit.ly`, `t.co`, `goo.gl`, `tinyurl`)
- Cryptocurrency / wallet / MetaMask references
- `window.open` redirects, `location.href` redirects
- External `<script src="...">` tags
- Credential/authentication flows

---

## Fixes Applied

### 1. Removed Google Docs iframe (`portfolio.html`)

**Before:** Embedded Google Slides via `<iframe src="https://docs.google.com/presentation/.../embed">`  
**After:** Static preview image (`coverphoto.jpg`) linking externally to Google Slides with clear label **"Open in Google Slides"** and `rel="noopener noreferrer"`.

### 2. Replaced misleading download CTA (`index.html`)

**Before:** `btn-download` class, download-arrow SVG, text **"Download PDF"**, `onclick="window.print()"`  
**After:** `btn-print` class, printer SVG, text **"Print Resume"**, `type="button"`, `aria-label="Print resume"`.

### 3. Hardened external links

- All `target="_blank"` links now include `rel="noopener noreferrer"`
- LinkedIn URL normalized to `https://www.linkedin.com/in/remicouture/`

### 4. Added page metadata (both files)

```html
<meta name="description" content="...">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

### 5. Same-origin navigation

- `index.html` portfolio banner link no longer opens a new tab for same-site `portfolio.html`

---

## Remaining Risks

| Risk | Severity | Notes |
|------|----------|-------|
| Personal contact info on homepage | Low–Medium | Expected for a resume. Not removed. |
| Game UI screenshots resembling auth/console screens | Medium | Inherent to a game UX portfolio; cannot remove without losing portfolio value. |
| YouTube thumbnail hotlinking | Low | Depends on `img.youtube.com` availability. |
| Google Fonts CDN dependency | Low | Trusted vendor; consider self-hosting fonts if paranoid about third-party requests. |
| No Content-Security-Policy header | Low | GitHub Pages does not support custom security headers without a reverse proxy/CDN. |
| Safe Browsing cache lag | Operational | Google may take **days to weeks** to re-crawl and clear a flag after fixes are deployed. |

---

## External Domains Referenced

Domains loaded or linked by the **deployed site**:

| Domain | Used in | Purpose | Loads executable JS? |
|--------|---------|---------|---------------------|
| `fonts.googleapis.com` | `index.html:9`, `portfolio.html:11` | Roboto font CSS | No (CSS only) |
| `fonts.gstatic.com` | `index.html:8`, `portfolio.html:10` | Font files (preconnect) | No (font files) |
| `www.linkedin.com` | `index.html:839`, `portfolio.html:1334` | Professional profile link | Only if user clicks |
| `youtu.be` | `portfolio.html:972` | YouTube video link | Only if user clicks |
| `www.youtube.com` | `portfolio.html:975` | YouTube video link | Only if user clicks |
| `img.youtube.com` | `portfolio.html:976, 1423` | Video thumbnail images | No (images only) |
| `docs.google.com` | `portfolio.html:1309, 1313` | External link to Google Slides (no embed) | Only if user clicks |

**Protocols (not domains):** `tel:4189078783`, `mailto:rcouture@gmail.com`

**Not referenced:** Analytics, ad networks, URL shorteners, crypto APIs, social widgets, CDNs beyond Google Fonts/YouTube.

---

## Most Likely Safe Browsing Triggers (Ranked)

Based on evidence from the **pre-fix** codebase and known Safe Browsing heuristics:

### 1. Google Docs iframe embed — **Highest probability**

```
portfolio.html:1310 (original)
<iframe src="https://docs.google.com/presentation/d/.../embed?...">
```

**Why:** This is structurally identical to phishing pages that embed Google login/document UI inside attacker-controlled domains. Automated systems weight this heavily.

### 2. "Download PDF" misleading CTA — **High probability**

```
index.html:851-865 (original)
<button class="btn-download" onclick="window.print()">Download PDF</button>
```

**Why:** Matches the Safe Browsing category **"downloading software"** — download icon + download language without an actual file download.

### 3. Prominent PII in header — **Moderate probability**

```
index.html:829-836
<a href="tel:...">418 907 8783</a>
<a href="mailto:rcouture@gmail.com">rcouture@gmail.com</a>
```

**Why:** Matches **"sharing personal information"** sub-category. Legitimate for resumes but amplifies other signals.

### 4. Game UI imagery resembling account/console interfaces — **Moderate probability**

Portfolio videos (`diagnostic.mp4`, `hiphopvid.mp4`, `gameresume.mp4`) and images (`mobile-game-main.png`, `agency-title.png`, etc.) depict interfaces that visual classifiers may score as deceptive UI.

### 5. Third-party embeds (YouTube thumbnails, Google Fonts) — **Low probability**

Standard web practice; unlikely primary cause.

---

## Verification After Fixes

Tested locally at `http://localhost:8766/` after changes:

| Check | Result |
|-------|--------|
| `index.html` loads | ✅ Pass |
| "Print Resume" button present | ✅ Pass |
| "Download PDF" absent | ✅ Pass |
| `portfolio.html` loads | ✅ Pass |
| Slideshow navigation works | ✅ Pass |
| No `<iframe>` in HTML | ✅ Pass |
| Google Slides opens via external link only | ✅ Pass |
| Resume ↔ Portfolio navigation | ✅ Pass |

---

## Recommended Next Steps for Google Safe Browsing Review

1. **Deploy fixes** — Push commits to `main` and confirm live site at https://remiclassic.github.io/remiresume/ reflects changes (no iframe, no "Download PDF").

2. **Request a review via Google Search Console**
   - Add property: `https://remiclassic.github.io/remiresume/`
   - Go to **Security Issues** → **Request Review**
   - Explain: *"Static personal resume/portfolio. Removed Google Docs iframe embed and misleading download button. No forms, no credential collection, no third-party scripts."*

3. **Check status**
   - Google Transparency Report: https://transparencyreport.google.com/safe-browsing/search
   - URL: `https://remiclassic.github.io/remiresume/`

4. **Wait for re-crawl** — Reviews typically take **2–10 business days**; cache propagation can take longer.

5. **Optional hardening (if flag persists)**
   - Self-host Roboto font files to eliminate Google Fonts requests
   - Replace YouTube hotlinked thumbnails with local image files
   - Add a hosted PDF resume with an honest label ("Resume PDF") instead of print-only flow
   - Add `robots.txt` and structured data (`schema.org/Person`) to reinforce legitimate identity

6. **Do not commit** local untracked artifacts (`slides/extracted/`, loose PDFs) to the Pages branch unless intentionally publishing them.

---

## Conclusion

The site is a **legitimate static portfolio** with **no evidence of compromise or malicious intent**. The Safe Browsing warning was almost certainly triggered by **deceptive-pattern lookalikes**: the Google Docs iframe embed and misleading download button, compounded by resume contact information and game-UI portfolio imagery.

All actionable code-level issues have been remediated. Remaining items are inherent to the site's purpose as a personal resume and game design portfolio.
