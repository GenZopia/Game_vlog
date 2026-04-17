const posts = require('./content/posts.js');
const heroUrls = {};
const imgUrls = {};

posts.forEach(function(p) {
  const hUrl = p.heroImage.url.split('?')[0];
  if (!heroUrls[hUrl]) heroUrls[hUrl] = [];
  heroUrls[hUrl].push(p.slug);

  if (p.images) {
    p.images.forEach(function(img) {
      const iUrl = img.url.split('?')[0];
      if (!imgUrls[iUrl]) imgUrls[iUrl] = [];
      imgUrls[iUrl].push(p.slug);
    });
  }
});

console.log('=== DUPLICATE HERO IMAGES ===');
Object.keys(heroUrls).forEach(function(url) {
  const slugs = heroUrls[url];
  if (slugs.length > 1) console.log(url.split('/').pop(), '->', slugs.join(', '));
});

console.log('\n=== DUPLICATE BODY IMAGES ===');
Object.keys(imgUrls).forEach(function(url) {
  const slugs = imgUrls[url];
  if (slugs.length > 1) console.log(url.split('/').pop(), '->', slugs.join(', '));
});
