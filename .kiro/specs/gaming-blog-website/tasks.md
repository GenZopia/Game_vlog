# Implementation Plan: Gaming Blog Website

## Overview

Build a static gaming blog website using a Node.js build script that generates HTML pages from content data and templates. The site covers game reviews, top lists, tips, game mechanics, and gaming news — at least 15 pages — with full SEO metadata, structured data, responsive design, and accessibility baked in at build time.

## Tasks

- [x] 1. Set up project structure and content data
  - Create the directory layout: `content/`, `templates/`, `assets/css/`, `assets/js/`, `dist/`
  - Create `content/posts.js` with all 10 blog post objects matching the `Post` interface (slug, title, seoTitle, metaDescription, category, datePublished, author, heroImage, images, excerpt, body ≥400 words, relatedSlugs ≥2, internalLinks)
  - Create `content/pages.js` with static page data for About and Contact
  - Ensure all five categories are represented and minimum post counts are met (reviews ≥3, game-mechanics ≥2, tips-tricks ≥2, gaming-news ≥1)
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 2. Create CSS and base styling
  - [x] 2.1 Write `assets/css/style.css` with consistent color scheme, typography (Google Fonts via `<link>`), and layout
    - Body font-size ≥ 16px, responsive grid/flexbox layout for 320px–1920px viewports
    - Style nav, footer, post cards, hero images, breadcrumbs, related posts section, and image fallback div
    - Ensure visible focus indicators on all interactive elements
    - _Requirements: 4.1, 4.6, 4.7, 7.3_

- [x] 3. Implement the SEO module and build utilities
  - [x] 3.1 Create `build.js` with a `buildHead(meta)` function that returns the full `<head>` HTML string
    - Output: `<title>`, `<meta name="description">`, `<meta property="og:*">` (posts only), `<link rel="canonical">`, `<meta name="viewport">`, `<html lang="en">`, JSON-LD `Article` (posts) or `WebSite` (homepage)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.2, 7.5_

  - [ ]* 3.2 Write property test for SEO head completeness (Properties 6, 7, 8, 22, 23)
    - **Property 6: Title tag length in range** — assert `<title>` length ∈ [50, 60] and unique across pages
    - **Property 7: Meta description length in range** — assert meta description length ∈ [150, 160] and unique
    - **Property 8: Blog post head completeness** — assert og:*, canonical, JSON-LD Article present on post pages
    - **Property 22: lang="en" on every page** — assert `<html lang="en">`
    - **Property 23: Viewport meta tag on every page** — assert viewport meta present
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 7.2, 7.5**

  - [x] 3.3 Add build-time validation in `build.js`
    - Throw if body word count < 400, seoTitle outside [50,60], metaDescription outside [150,160], relatedSlugs.length < 2, or heroImage.width < 600
    - Log warnings for duplicate seoTitle/metaDescription, missing relatedSlug targets, and unresolvable internalLink slugs
    - _Requirements: 2.7, 3.1, 3.2, 5.3_

  - [ ]* 3.4 Write unit tests for build-time validation edge cases
    - Post with exactly 400 words passes; seoTitle of exactly 50 and 60 chars passes; metaDescription of exactly 150 and 160 chars passes
    - _Requirements: 2.7, 3.1, 3.2_

- [x] 4. Create HTML templates
  - [x] 4.1 Write `templates/base.html` — shared shell with `{HEAD}`, `<nav>`, `<main>{CONTENT}</main>`, `<footer>` placeholders
    - Nav links: Home, Reviews, Top Lists, Tips & Tricks, Game Mechanics, Gaming News, About, Contact
    - Footer: copyright text + links to About and Contact
    - _Requirements: 4.2, 4.3, 6.1_

  - [x] 4.2 Write `templates/post.html` — blog post layout
    - Breadcrumb (`Home > {Category} > {Post Title}`), hero `<img>` (width ≥ 600), `<h1>`, article body, related posts section (≥2 links)
    - _Requirements: 4.4, 4.5, 6.3, 6.5_

  - [x] 4.3 Write `templates/category.html` — category listing layout with post card grid
    - Each card: hero thumbnail `<img>`, title, category label, date, excerpt
    - _Requirements: 4.4, 6.2_

  - [x] 4.4 Write `templates/index.html` — homepage layout with post card grid and JSON-LD WebSite block
    - _Requirements: 1.3, 3.6, 4.4_

- [x] 5. Implement the build script
  - [x] 5.1 Write the main generation logic in `build.js`
    - Read `content/posts.js` and `content/pages.js`, render each template with content data, inject `buildHead()` output, write files to `dist/`
    - Generate: `dist/index.html`, `dist/about.html`, `dist/contact.html`, `dist/posts/[slug].html`, `dist/category/[slug].html`
    - Inject breadcrumb JSON-LD `BreadcrumbList` on post pages
    - Inject internal links and related posts into post body
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.3, 6.4, 6.5_

  - [x] 5.2 Generate `dist/sitemap.xml` and `dist/robots.txt` in `build.js`
    - sitemap.xml: `<loc>` entry for every HTML page URL
    - robots.txt: `User-agent: *` / `Allow: /` / `Sitemap:` directive
    - _Requirements: 3.9, 3.10_

  - [ ]* 5.3 Write property tests for build output structure (Properties 1, 2, 3, 4, 11, 13, 14)
    - **Property 1: Minimum page count** — count HTML files in dist/, assert ≥ 15
    - **Property 2: All categories have a listing page** — assert each of 5 category pages exists
    - **Property 3: Homepage links to all posts** — parse index.html, assert all slug hrefs present
    - **Property 4: Category minimum post counts** — assert reviews ≥3, game-mechanics ≥2, tips-tricks ≥2, gaming-news ≥1
    - **Property 11: Sitemap contains all pages** — parse sitemap.xml, assert every page URL in `<loc>`
    - **Property 13: Navigation links on every page** — assert all 8 nav hrefs present on every page
    - **Property 14: Footer links on every page** — assert about and contact links in footer on every page
    - **Validates: Requirements 1.1, 1.2, 1.3, 2.3, 2.4, 2.5, 2.6, 3.9, 4.2, 4.3, 6.1**

  - [ ]* 5.4 Write unit tests for build output examples
    - `dist/about.html` and `dist/contact.html` exist
    - `dist/robots.txt` exists and contains `Allow: /`
    - Homepage contains a link to "top-10-games-2024"
    - Homepage `<head>` contains JSON-LD with `@type: "WebSite"`
    - _Requirements: 1.4, 2.2, 3.6, 3.10_

- [x] 6. Checkpoint — Ensure all tests pass
  - Run the build script and verify `dist/` is populated correctly; ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement content correctness and post page properties
  - [x] 7.1 Verify post pages render all required structural elements
    - Single `<h1>`, at least one `<h2>` in body, hero image before article body, breadcrumb with 3 items, related posts section
    - _Requirements: 3.7, 3.8, 4.5, 6.3, 6.5_

  - [ ]* 7.2 Write property tests for post page structure (Properties 5, 9, 10, 15, 16, 17, 18, 19, 20, 21)
    - **Property 5: Body word count ≥ 400** — strip HTML, count tokens, assert ≥ 400
    - **Property 9: Single h1 per page** — count `<h1>` elements, assert exactly 1
    - **Property 10: Body sections use h2/h3** — assert ≥ 1 `<h2>` in article body
    - **Property 15: Homepage cards contain required fields** — assert img, title, category, date, excerpt on each card
    - **Property 16: Hero image present on post pages** — assert hero `<img>` precedes article body in DOM
    - **Property 17: Hero image width ≥ 600px** — assert hero img width attribute ≥ 600
    - **Property 18: Category pages list all category posts** — assert all matching posts linked on each category page
    - **Property 19: Breadcrumb has three correct items** — assert Home > Category > Post Title order
    - **Property 20: Internal links rendered in body** — assert each internalLink target slug linked in body
    - **Property 21: Related posts section has ≥ 2 same-category links** — assert ≥ 2 same-category links in related posts
    - **Validates: Requirements 2.7, 3.7, 3.8, 4.4, 4.5, 5.1, 5.3, 6.2, 6.3, 6.4, 6.5**

  - [ ]* 7.3 Write property test for image alt text (Property 12)
    - **Property 12: No images missing alt text** — assert every `<img>` has non-empty alt on every page
    - **Validates: Requirements 3.11, 5.2**

- [x] 8. Implement client-side JavaScript
  - [x] 8.1 Write `assets/js/main.js` with lazy-load handler
    - Use `IntersectionObserver` to swap `data-src` → `src` on non-hero images below the fold
    - Ensure non-hero images in templates use `data-src` instead of `src`
    - _Requirements: 7.1_

  - [x] 8.2 Write image fallback handler in `assets/js/main.js`
    - Attach `onerror` to all `<img>` elements; on failure replace with `<div class="img-fallback">` showing alt text, styled with neutral background and centered text
    - _Requirements: 5.4_

  - [ ]* 8.3 Write unit tests for client-side JS
    - Lazy-load: assert non-hero images use `data-src` attribute in generated HTML
    - Image fallback: simulate `onerror`, assert fallback div rendered with alt text
    - Body font-size in `style.css` is ≥ 16px
    - _Requirements: 5.4, 7.1, 4.7_

- [x] 9. Final checkpoint — Ensure all tests pass
  - Run the full build and all tests; ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with a minimum of 100 iterations per property
- Each property test must include a comment: `// Feature: gaming-blog-website, Property N: <property_text>`
- Unit tests and property tests are complementary — both are needed for full coverage
