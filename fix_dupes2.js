const fs = require('fs');
const posts = require('./content/posts.js');

const heroFixes2 = {
  'sekiro-shadows-die-twice-review': {
    url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=600&fit=crop',
    alt: 'Sekiro samurai warrior in dark atmospheric Japanese castle environment'
  }
};

const bodyFixes2 = {
  'sekiro-shadows-die-twice-review': {
    url: 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?w=800&h=450&fit=crop',
    alt: 'Sekiro combat scene showing precise sword fighting and posture mechanics'
  },
  'how-to-build-a-gaming-pc-on-a-budget': {
    url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&h=450&fit=crop',
    alt: 'Budget gaming PC components including GPU motherboard and RAM on table'
  },
  'how-to-get-better-at-strategy-games': {
    url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=450&fit=crop',
    alt: 'Strategy game map overview showing resource management and unit positioning'
  }
};

posts.forEach(function(post) {
  if (heroFixes2[post.slug]) {
    post.heroImage.url = heroFixes2[post.slug].url;
    post.heroImage.alt = heroFixes2[post.slug].alt;
  }
  if (bodyFixes2[post.slug] && post.images && post.images[0]) {
    post.images[0].url = bodyFixes2[post.slug].url;
    post.images[0].alt = bodyFixes2[post.slug].alt;
  }
});

const output = '// content/posts.js — All blog post data for the gaming blog\n\nconst posts = ' +
  JSON.stringify(posts, null, 2) + ';\n\nmodule.exports = posts;\n';

fs.writeFileSync('./content/posts.js', output, 'utf8');
console.log('Done round 2.');
