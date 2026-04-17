// build.js — Static site generator for Gaming Hub
const fs = require('fs');
const path = require('path');

// ─── SEO Module ───────────────────────────────────────────────────────────────

/**
 * Builds the full <head> HTML string for a given page.
 * @param {Object} meta
 * @param {string} meta.seoTitle        - 50–60 char page title
 * @param {string} meta.metaDescription - 150–160 char meta description
 * @param {string} meta.canonicalUrl    - Absolute canonical URL
 * @param {string} [meta.ogImage]       - OG image URL (posts only)
 * @param {boolean} meta.isPost         - Whether this is a blog post page
 * @param {boolean} meta.isHomepage     - Whether this is the homepage
 * @param {Object} [meta.post]          - Full post object (when isPost=true)
 * @returns {string} HTML string for the <head> element content
 */
function buildHead(meta) {
  const { seoTitle, metaDescription, canonicalUrl, ogImage, isPost, isHomepage, post } = meta;

  const ogTags = isPost ? `
  <meta property="og:title" content="${escAttr(seoTitle)}">
  <meta property="og:description" content="${escAttr(metaDescription)}">
  <meta property="og:image" content="${escAttr(ogImage || '')}">
  <meta property="og:type" content="article">` : '';

  let jsonLd = '';
  if (isPost && post) {
    jsonLd = `
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.datePublished,
    image: post.heroImage.url,
    description: post.metaDescription,
    url: canonicalUrl
  }, null, 2)}
  </script>`;
  } else if (isHomepage) {
    jsonLd = `
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Gaming Hub',
    url: canonicalUrl
  }, null, 2)}
  </script>`;
  }

  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escHtml(seoTitle)}</title>
  <meta name="description" content="${escAttr(metaDescription)}">
  <link rel="canonical" href="${escAttr(canonicalUrl)}">${ogTags}
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8600182060320313" crossorigin="anonymous"></script>${jsonLd}`;
}

// ─── Escape helpers ───────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

// ─── Build-time validation ────────────────────────────────────────────────────

/**
 * Validates all posts before generation. Throws on hard errors, logs warnings.
 * @param {Object[]} posts
 */
function validatePosts(posts) {
  const seenTitles = new Map();   // seoTitle → slug
  const seenDescs  = new Map();   // metaDescription → slug
  const slugSet    = new Set(posts.map(p => p.slug));

  for (const post of posts) {
    const { slug, seoTitle, metaDescription, body, relatedSlugs, heroImage, internalLinks } = post;

    // Hard errors — throw immediately
    const wordCount = countWords(body);
    if (wordCount < 400) {
      throw new Error(`[${slug}] body word count is ${wordCount} (minimum 400)`);
    }

    if (seoTitle.length < 50 || seoTitle.length > 60) {
      throw new Error(`[${slug}] seoTitle length is ${seoTitle.length} (must be 50–60): "${seoTitle}"`);
    }

    if (metaDescription.length < 150 || metaDescription.length > 160) {
      throw new Error(`[${slug}] metaDescription length is ${metaDescription.length} (must be 150–160): "${metaDescription}"`);
    }

    if (!relatedSlugs || relatedSlugs.length < 2) {
      throw new Error(`[${slug}] relatedSlugs has ${relatedSlugs ? relatedSlugs.length : 0} entries (minimum 2)`);
    }

    if (!heroImage || heroImage.width < 600) {
      throw new Error(`[${slug}] heroImage.width is ${heroImage ? heroImage.width : 'missing'} (minimum 600)`);
    }

    // Warnings — log but continue
    if (seenTitles.has(seoTitle)) {
      console.warn(`[WARN] Duplicate seoTitle between "${slug}" and "${seenTitles.get(seoTitle)}": "${seoTitle}"`);
    } else {
      seenTitles.set(seoTitle, slug);
    }

    if (seenDescs.has(metaDescription)) {
      console.warn(`[WARN] Duplicate metaDescription between "${slug}" and "${seenDescs.get(metaDescription)}"`);
    } else {
      seenDescs.set(metaDescription, slug);
    }

    for (const related of relatedSlugs) {
      if (!slugSet.has(related)) {
        console.warn(`[WARN] [${slug}] relatedSlug "${related}" does not match any post slug`);
      }
    }

    if (internalLinks) {
      for (const link of internalLinks) {
        if (!slugSet.has(link.targetSlug)) {
          console.warn(`[WARN] [${slug}] internalLink targetSlug "${link.targetSlug}" does not match any post slug`);
        }
      }
    }
  }
}

/**
 * Strips HTML tags and counts whitespace-delimited tokens.
 * @param {string} html
 * @returns {number}
 */
function countWords(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORIES = {
  'reviews':        { name: 'Reviews',        desc: 'In-depth, honest assessments of the latest and greatest games across all platforms.' },
  'top-lists':      { name: 'Top Lists',       desc: 'Curated collections of the best games by genre, year, platform, and theme.' },
  'tips-tricks':    { name: 'Tips & Tricks',   desc: 'Practical guides, walkthroughs, and strategies to help you get the most out of your games.' },
  'game-mechanics': { name: 'Game Mechanics',  desc: 'Deep dives into the systems and design philosophies that make games tick.' },
  'gaming-news':    { name: 'Gaming News',     desc: 'Coverage of industry trends, announcements, and developments shaping the future of gaming.' },
};

const BASE_URL = 'https://www.genzopia.xyz';

// ─── Template helpers ─────────────────────────────────────────────────────────

/**
 * Injects {HEAD} and {CONTENT} into base.html shell.
 */
function applyBase(baseTemplate, head, content) {
  return baseTemplate
    .replace('{HEAD}', head)
    .replace('{CONTENT}', content);
}

/**
 * Formats an ISO date string to a human-readable display date.
 */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Renders a post card HTML snippet used on index and category pages.
 */
function renderPostCard(post) {
  const cat = CATEGORIES[post.category] || { name: post.category };
  return `          <article class="post-card">
            <a href="/posts/${post.slug}.html" class="post-card__img-link" tabindex="-1" aria-hidden="true">
              <img data-src="${escAttr(post.heroImage.url)}"
                   alt="${escAttr(post.heroImage.alt)}"
                   width="${post.heroImage.width}" height="${post.heroImage.height}"
                   class="post-card__img" loading="lazy">
            </a>
            <div class="post-card__body">
              <a href="/category/${escAttr(post.category)}.html" class="category-label category-label--${escAttr(post.category)}">${escHtml(cat.name)}</a>
              <h2 class="post-card__title"><a href="/posts/${post.slug}.html">${escHtml(post.title)}</a></h2>
              <time class="post-card__date" datetime="${escAttr(post.datePublished)}">${formatDate(post.datePublished)}</time>
              <p class="post-card__excerpt">${escHtml(post.excerpt)}</p>
              <a href="/posts/${post.slug}.html" class="post-card__read-more">Read More</a>
            </div>
          </article>`;
}

/**
 * Injects internal links into post body HTML.
 * Replaces anchor text with <a href> on first occurrence only.
 */
function injectInternalLinks(body, internalLinks, slugSet) {
  if (!internalLinks || internalLinks.length === 0) return body;
  let result = body;
  for (const link of internalLinks) {
    if (!slugSet.has(link.targetSlug)) continue;
    // Only replace first occurrence, avoid double-linking
    const escaped = link.anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<!href="[^"]*)(${escaped})(?![^<]*<\/a>)`, '');
    result = result.replace(re, `<a href="/posts/${link.targetSlug}.html">$1</a>`);
  }
  return result;
}

/**
 * Renders the related posts section for a post page.
 * Prioritises same-category posts; falls back to any same-category posts
 * from allPosts to guarantee at least 2 links (Req 6.5).
 */
function renderRelatedPosts(post, allPosts, slugSet) {
  // Start with explicitly listed related slugs that exist
  const fromSlugs = post.relatedSlugs
    .filter(s => slugSet.has(s))
    .map(s => allPosts.find(p => p.slug === s))
    .filter(Boolean);

  // Filter to same-category first
  const sameCat = fromSlugs.filter(p => p.category === post.category);

  // If we have fewer than 2 same-category from relatedSlugs, supplement from allPosts
  const usedSlugs = new Set(sameCat.map(p => p.slug));
  usedSlugs.add(post.slug);
  if (sameCat.length < 2) {
    for (const p of allPosts) {
      if (sameCat.length >= 4) break;
      if (p.category === post.category && !usedSlugs.has(p.slug)) {
        sameCat.push(p);
        usedSlugs.add(p.slug);
      }
    }
  }

  // If still fewer than 2 (e.g. only 1 post in category), fall back to any related posts
  const related = sameCat.length >= 2 ? sameCat.slice(0, 4) : fromSlugs.slice(0, 4);

  return related.map(rel => {
    const cat = CATEGORIES[rel.category] || { name: rel.category };
    return `          <article class="related-post-card">
            <a href="/posts/${rel.slug}.html">
              <img data-src="${escAttr(rel.heroImage.url)}"
                   alt="${escAttr(rel.heroImage.alt)}"
                   width="${rel.heroImage.width}" height="${rel.heroImage.height}"
                   class="related-post-card__img" loading="lazy">
              <div class="related-post-card__body">
                <span class="category-label category-label--${escAttr(rel.category)}">${escHtml(cat.name)}</span>
                <h3 class="related-post-card__title">${escHtml(rel.title)}</h3>
                <time datetime="${escAttr(rel.datePublished)}">${formatDate(rel.datePublished)}</time>
              </div>
            </a>
          </article>`;
  }).join('\n');
}

/**
 * Builds the BreadcrumbList JSON-LD for a post page.
 */
function buildBreadcrumbJsonLd(post) {
  const cat = CATEGORIES[post.category] || { name: post.category };
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/index.html` },
      { '@type': 'ListItem', position: 2, name: cat.name, item: `${BASE_URL}/category/${post.category}.html` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${BASE_URL}/posts/${post.slug}.html` },
    ]
  }, null, 2);
}

// ─── Page generators ──────────────────────────────────────────────────────────

function generatePostPage(post, allPosts, slugSet, baseTemplate, postTemplate) {
  const cat = CATEGORIES[post.category] || { name: post.category };
  const canonicalUrl = `${BASE_URL}/posts/${post.slug}.html`;

  const head = buildHead({
    seoTitle: post.seoTitle,
    metaDescription: post.metaDescription,
    canonicalUrl,
    ogImage: post.heroImage.url,
    isPost: true,
    isHomepage: false,
    post,
  });

  const bodyWithLinks = injectInternalLinks(post.body, post.internalLinks, slugSet);
  const relatedHtml = renderRelatedPosts(post, allPosts, slugSet);

  const content = postTemplate
    .replace(/{CATEGORY_SLUG}/g, escAttr(post.category))
    .replace(/{CATEGORY_NAME}/g, escHtml(cat.name))
    .replace(/{POST_TITLE}/g, escHtml(post.title))
    .replace('{AUTHOR}', escHtml(post.author))
    .replace('{DATE_ISO}', escAttr(post.datePublished))
    .replace('{DATE_DISPLAY}', formatDate(post.datePublished))
    .replace('{HERO_IMAGE_URL}', escAttr(post.heroImage.url))
    .replace('{HERO_IMAGE_ALT}', escAttr(post.heroImage.alt))
    .replace('{HERO_IMAGE_WIDTH}', post.heroImage.width)
    .replace('{HERO_IMAGE_HEIGHT}', post.heroImage.height)
    .replace('{BODY}', bodyWithLinks)
    .replace('{RELATED_POSTS}', relatedHtml)
    .replace('{BREADCRUMB_JSON_LD}', buildBreadcrumbJsonLd(post));

  return applyBase(baseTemplate, head, content);
}

function generateCategoryPage(categorySlug, posts, baseTemplate, categoryTemplate) {
  const cat = CATEGORIES[categorySlug];
  const canonicalUrl = `${BASE_URL}/category/${categorySlug}.html`;
  const catPosts = posts.filter(p => p.category === categorySlug);

  const head = buildHead({
    seoTitle: `${cat.name} — Gaming Hub | Game Reviews & News`,
    metaDescription: `Browse all ${cat.name} articles on Gaming Hub. ${cat.desc}`.slice(0, 160),
    canonicalUrl,
    isPost: false,
    isHomepage: false,
  });

  const postCards = catPosts.map(renderPostCard).join('\n');

  const content = categoryTemplate
    .replace(/{CATEGORY_SLUG}/g, escAttr(categorySlug))
    .replace(/{CATEGORY_NAME}/g, escHtml(cat.name))
    .replace('{CATEGORY_DESC}', escHtml(cat.desc))
    .replace('{POST_CARDS}', postCards);

  return applyBase(baseTemplate, head, content);
}

function generateIndexPage(posts, baseTemplate, indexTemplate) {
  const canonicalUrl = `${BASE_URL}/index.html`;

  const head = buildHead({
    seoTitle: 'Gaming Hub — Reviews, Top Lists, Tips & Gaming News',
    metaDescription: 'Gaming Hub is your ultimate destination for game reviews, top 10 lists, tips and tricks, game mechanics deep dives, and the latest gaming news.',
    canonicalUrl,
    isPost: false,
    isHomepage: true,
  });

  const postCards = posts.map(renderPostCard).join('\n');
  const content = indexTemplate.replace('{POST_CARDS}', postCards);

  return applyBase(baseTemplate, head, content);
}

function generateStaticPage(pageData, baseTemplate) {
  const canonicalUrl = `${BASE_URL}/${pageData.slug}.html`;

  const head = buildHead({
    seoTitle: pageData.seoTitle,
    metaDescription: pageData.metaDescription,
    canonicalUrl,
    isPost: false,
    isHomepage: false,
  });

  const content = `    <div class="container main-content">
      <article class="article-layout article-layout--single">
        <div>
          <header class="article-header">
            <h1 class="article-title">${escHtml(pageData.title)}</h1>
          </header>
          <div class="article-body">
${pageData.body}
          </div>
        </div>
      </article>
    </div>`;

  return applyBase(baseTemplate, head, content);
}

// ─── Sitemap & robots ─────────────────────────────────────────────────────────

function generateSitemap(posts) {
  const urls = [
    `${BASE_URL}/index.html`,
    `${BASE_URL}/about.html`,
    `${BASE_URL}/contact.html`,
    ...Object.keys(CATEGORIES).map(slug => `${BASE_URL}/category/${slug}.html`),
    ...posts.map(p => `${BASE_URL}/posts/${p.slug}.html`),
  ];

  const urlEntries = urls.map(url => `  <url>\n    <loc>${url}</loc>\n  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function generateRobots() {
  return `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`;
}

// ─── Main build ───────────────────────────────────────────────────────────────

function build() {
  const posts = require('./content/posts');
  const pages = require('./content/pages');

  // Validate before generating anything
  validatePosts(posts);

  // Read templates
  const baseTemplate     = fs.readFileSync(path.join(__dirname, 'templates/base.html'), 'utf8');
  const postTemplate     = fs.readFileSync(path.join(__dirname, 'templates/post.html'), 'utf8');
  const categoryTemplate = fs.readFileSync(path.join(__dirname, 'templates/category.html'), 'utf8');
  const indexTemplate    = fs.readFileSync(path.join(__dirname, 'templates/index.html'), 'utf8');

  const slugSet = new Set(posts.map(p => p.slug));

  // Ensure output directories exist
  fs.mkdirSync(path.join(__dirname, 'dist/posts'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'dist/category'), { recursive: true });

  // Homepage
  fs.writeFileSync(
    path.join(__dirname, 'dist/index.html'),
    generateIndexPage(posts, baseTemplate, indexTemplate),
    'utf8'
  );
  console.log('✓ dist/index.html');

  // Static pages (about, contact)
  for (const [, pageData] of Object.entries(pages)) {
    fs.writeFileSync(
      path.join(__dirname, `dist/${pageData.slug}.html`),
      generateStaticPage(pageData, baseTemplate),
      'utf8'
    );
    console.log(`✓ dist/${pageData.slug}.html`);
  }

  // Post pages
  for (const post of posts) {
    fs.writeFileSync(
      path.join(__dirname, `dist/posts/${post.slug}.html`),
      generatePostPage(post, posts, slugSet, baseTemplate, postTemplate),
      'utf8'
    );
    console.log(`✓ dist/posts/${post.slug}.html`);
  }

  // Category pages
  for (const categorySlug of Object.keys(CATEGORIES)) {
    fs.writeFileSync(
      path.join(__dirname, `dist/category/${categorySlug}.html`),
      generateCategoryPage(categorySlug, posts, baseTemplate, categoryTemplate),
      'utf8'
    );
    console.log(`✓ dist/category/${categorySlug}.html`);
  }

  // Sitemap & robots
  fs.writeFileSync(path.join(__dirname, 'dist/sitemap.xml'), generateSitemap(posts), 'utf8');
  console.log('✓ dist/sitemap.xml');

  fs.writeFileSync(path.join(__dirname, 'dist/robots.txt'), generateRobots(), 'utf8');
  console.log('✓ dist/robots.txt');

  fs.writeFileSync(path.join(__dirname, 'dist/_headers'), '/sitemap.xml\n  Content-Type: application/xml; charset=utf-8\n', 'utf8');
  console.log('✓ dist/_headers');

  fs.writeFileSync(path.join(__dirname, 'dist/ads.txt'), 'google.com, pub-8600182060320313, DIRECT, f08c47fec0942fa0\n', 'utf8');
  console.log('✓ dist/ads.txt');

  // Copy assets into dist/
  function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath  = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) copyDir(srcPath, destPath);
      else fs.copyFileSync(srcPath, destPath);
    }
  }
  copyDir(path.join(__dirname, 'assets'), path.join(__dirname, 'dist/assets'));
  console.log('✓ dist/assets/');

  console.log(`\nBuild complete — ${posts.length} posts, ${Object.keys(CATEGORIES).length} categories`);
}

// Run if called directly
if (require.main === module) {
  build();
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { buildHead, validatePosts, countWords, escHtml, escAttr, build, generateSitemap, generateRobots, CATEGORIES, BASE_URL };
