const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

// 1. Update index.html
const indexPath = path.join(baseDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
indexHtml = indexHtml.replace(/assets\/images\/packages\/([^"']+)\.(jpg|png)/gi, 'assets/images/packages/$1.webp');
fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('index.html updated to use .webp');

// 2. Update pages/bang-gia.html
const bgPath = path.join(baseDir, 'pages', 'bang-gia.html');
let bgHtml = fs.readFileSync(bgPath, 'utf8');
bgHtml = bgHtml.replace(/\.\.\/assets\/images\/packages\/([^"']+)\.(jpg|png)/gi, '../assets/images/packages/$1.webp');
fs.writeFileSync(bgPath, bgHtml, 'utf8');
console.log('pages/bang-gia.html updated to use .webp');

// 3. Remove .jpg and .png files from assets/images/packages and assets/images/main (that have a corresponding .webp)
const pkgsDir = path.join(baseDir, 'assets', 'images', 'packages');
const mainDir = path.join(baseDir, 'assets', 'images', 'main');

let removedCount = 0;
let savedBytes = 0;

function cleanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.png')) {
      if (f === 'fptlogo.png') continue; // keep logo.png
      const baseName = path.parse(f).name;
      const webpPath = path.join(dir, `${baseName}.webp`);
      const filePath = path.join(dir, f);
      if (fs.existsSync(webpPath)) {
        savedBytes += fs.statSync(filePath).size;
        fs.unlinkSync(filePath);
        removedCount++;
      }
    }
  }
}

cleanDir(pkgsDir);
cleanDir(mainDir);

console.log(`Cleaned up ${removedCount} redundant JPG/PNG files, freeing ${(savedBytes / (1024 * 1024)).toFixed(2)} MB!`);
