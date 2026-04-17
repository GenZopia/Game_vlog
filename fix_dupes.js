const fs = require('fs');
const posts = require('./content/posts.js');

// Map of slug -> new heroImage url+alt
const heroFixes = {
  'how-to-start-game-streaming': {
    url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1200&h=600&fit=crop',
    alt: 'Live streaming setup with microphone camera and gaming equipment on desk'
  },
  'top-5-rpgs-for-beginners': {
    url: 'https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?w=1200&h=600&fit=crop',
    alt: 'Beginner RPG player exploring a colourful fantasy game world on screen'
  },
  'greatest-gaming-moments-of-all-time': {
    url: 'https://images.unsplash.com/photo-1585620385456-4759f9b5c7d9?w=1200&h=600&fit=crop',
    alt: 'Gamer celebrating an epic victory moment with hands raised in triumph'
  },
  'how-to-get-better-at-strategy-games': {
    url: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=1200&h=600&fit=crop',
    alt: 'Chess board representing strategic thinking and planning in strategy games'
  },
  'understanding-game-difficulty-settings': {
    url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1200&h=600&fit=crop',
    alt: 'Game difficulty settings menu on screen showing easy normal and hard options'
  },
  'history-of-video-games': {
    url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop',
    alt: 'Retro arcade machines in a dark room representing the history of gaming'
  },
  'sekiro-shadows-die-twice-review': {
    url: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=1200&h=600&fit=crop',
    alt: 'Japanese samurai sword and cherry blossoms representing Sekiro atmosphere'
  },
  'how-to-build-a-gaming-pc-on-a-budget': {
    url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=1200&h=600&fit=crop',
    alt: 'PC components laid out on table ready for budget gaming PC build assembly'
  },
  'best-rpgs-of-all-time': {
    url: 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?w=1200&h=600&fit=crop',
    alt: 'Fantasy RPG map with dice and adventure items representing classic RPGs'
  },
  'mobile-gaming-guide-2024': {
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop',
    alt: 'Person playing mobile game on smartphone with focused expression outdoors'
  },
  'best-co-op-games-2024': {
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=600&fit=crop',
    alt: 'Group of friends laughing and playing video games together on a couch'
  },
  'is-gaming-good-for-you': {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop',
    alt: 'Happy person gaming with a smile showing the positive benefits of gaming'
  }
};

// Map of slug -> new body image url+alt
const bodyFixes = {
  'top-5-rpgs-for-beginners': {
    url: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&h=450&fit=crop',
    alt: 'Beginner RPG player character selection screen with multiple class options'
  },
  'greatest-gaming-moments-of-all-time': {
    url: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&h=450&fit=crop',
    alt: 'Dramatic gaming moment on screen with player reacting in amazement'
  },
  'understanding-game-difficulty-settings': {
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&h=450&fit=crop',
    alt: 'Player adjusting game settings on a console controller comfortably'
  },
  'history-of-video-games': {
    url: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=800&h=450&fit=crop',
    alt: 'Old retro game cartridges and controllers showing the evolution of gaming'
  },
  'the-rise-of-live-service-games': {
    url: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=800&h=450&fit=crop',
    alt: 'Live service game update notification on screen with seasonal content'
  },
  'ultimate-gaming-setup-guide': {
    url: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=800&h=450&fit=crop',
    alt: 'Organised gaming desk with mechanical keyboard mouse and clean cable management'
  },
  'is-gaming-good-for-you': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop',
    alt: 'Brain activity scan showing cognitive benefits of playing video games'
  },
  'how-to-start-game-streaming': {
    url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&h=450&fit=crop',
    alt: 'Streamer recording gameplay with webcam microphone and dual monitor setup'
  }
};

// Apply hero fixes
posts.forEach(function(post) {
  if (heroFixes[post.slug]) {
    post.heroImage.url = heroFixes[post.slug].url;
    post.heroImage.alt = heroFixes[post.slug].alt;
  }
  if (bodyFixes[post.slug] && post.images && post.images[0]) {
    post.images[0].url = bodyFixes[post.slug].url;
    post.images[0].alt = bodyFixes[post.slug].alt;
  }
});

const output = '// content/posts.js — All blog post data for the gaming blog\n\nconst posts = ' +
  JSON.stringify(posts, null, 2) + ';\n\nmodule.exports = posts;\n';

fs.writeFileSync('./content/posts.js', output, 'utf8');
console.log('Done. Duplicates fixed.');
