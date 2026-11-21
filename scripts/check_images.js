const fs = require('fs');
const path = require('path');

function checkFileImages(relPath, baseDir) {
  const content = fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
  const matches = [...content.matchAll(/src=["']([^"']+\.(jpg|png|webp|svg))["']/gi)];
  let missing = [];
  for (const m of matches) {
    const src = m[1];
    if (src.startsWith('http') || src.startsWith('data:')) continue;
    const resolved = path.resolve(path.join(__dirname, '..', baseDir), src);
    if (!fs.existsSync(resolved)) {
      missing.push({ src, resolved });
    }
  }
  return missing;
}

const missingBg = checkFileImages('pages/bang-gia.html', 'pages');
console.log('Missing images in bang-gia.html:', missingBg.length);
if (missingBg.length > 0) console.log(missingBg);

const missingIndex = checkFileImages('index.html', '.');
console.log('Missing images in index.html:', missingIndex.length);
if (missingIndex.length > 0) console.log(missingIndex);

const missingPolicy = checkFileImages('pages/chinh-sach.html', 'pages');
console.log('Missing images in chinh-sach.html:', missingPolicy.length);
if (missingPolicy.length > 0) console.log(missingPolicy);
