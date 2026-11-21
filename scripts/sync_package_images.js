const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'gói cước');
const destPackagesDir = path.join(__dirname, '..', 'assets', 'images', 'packages');
const destMainDir = path.join(__dirname, '..', 'assets', 'images', 'main');

if (!fs.existsSync(destPackagesDir)) {
  fs.mkdirSync(destPackagesDir, { recursive: true });
}

const MAP = {
  "Combo An Tâm.jpg": "combo-an-tam.jpg",
  "Combo FGame F1 Lite.jpg": "combo-fgame-f1-lite.jpg",
  "Combo FGame F2 Lite.jpg": "combo-fgame-f2-lite.jpg",
  "Combo FGame F3 Lite.jpg": "combo-fgame-f3-lite.jpg",
  "Combo FGame Lite.jpg": "combo-fgame-lite.jpg",
  "Combo giga vvip.jpg": "combo-giga-vvip.jpg",
  "COMBO LUX500 - VVIP.jpg": "combo-lux500-vvip.jpg",
  "COMBO LUX800 - VVIP.jpg": "combo-lux800-vvip.jpg",
  "Combo Meta F1 Lite.jpg": "combo-meta-f1-lite.jpg",
  "Combo Meta F1.jpg": "combo-meta-f1.jpg",
  "Combo Meta F2 Lite.jpg": "combo-meta-f2-lite.jpg",
  "Combo Meta F2.jpg": "combo-meta-f2.jpg",
  "Combo Meta F3 Lite.jpg": "combo-meta-f3-lite.jpg",
  "Combo Meta F3.jpg": "combo-meta-f3.jpg",
  "Combo Meta Lite.jpg": "combo-meta-lite.jpg",
  "Combo meta vvip.jpg": "combo-meta-vvip.jpg",
  "Combo Meta.jpg": "combo-meta.jpg",
  "Combo Sky F2.jpg": "combo-sky-f2.jpg",
  "Combo sky vvip.jpg": "combo-sky-vvip.jpg",
  "COMBO SPEEDX1 - V.VIP.jpg": "combo-speedx1-vvip.jpg",
  "FPT SpeedX10 Pro Lite.jpg": "fpt-speedx10-pro-lite.jpg",
  "FPT SpeedX10 Pro.jpg": "fpt-speedx10-pro.jpg",
  "FPT SpeedX10.jpg": "fpt-speedx10.jpg",
  "FPT SpeedX2 Pro Lite.jpg": "fpt-speedx2-pro-lite.jpg",
  "FPT SpeedX2 Pro.jpg": "fpt-speedx2-pro.jpg",
  "FPT SpeedX2.jpg": "fpt-speedx2.jpg",
  "Gói FGame.jpg": "internet-fgame.jpg",
  "Internet F-Game F1.jpg": "internet-fgame-f1.jpg",
  "Internet GIGA F1.jpg": "internetgigaf1.jpg",
  "Internet Giga.jpg": "internetgiga.jpg",
  "Internet Sky F1.jpg": "internetskyf1.jpg",
  "Internet Sky.jpg": "internetsky.jpg",
  "internet-lux-500-fpt.jpg": "lux500-doanhnghiep.jpg",
  "internet-lux-800-fpt.jpg": "lux800-doanhnghiep.jpg",
  "Sky an tâm 7 - play4.jpg": "sky-an-tam-7-play4.jpg",
  "Sky an tâm 7 - play4s.jpg": "sky-an-tam-7-play4s.jpg",
  "Sky F1 an tâm 7 - play4.jpg": "sky-f1-an-tam-7-play4.jpg",
  "Sky F2 an tâm 7 - play4.jpg": "sky-f2-an-tam-7-play4.jpg",
  "Sky F2 an tâm 7 - play4s.jpg": "sky-f2-an-tam-7-play4s.jpg",
  "Sky F3 an tâm 7 - play4.jpg": "sky-f3-an-tam-7-play4.jpg",
  "Sky F3 an tâm 7 - play4s.jpg": "sky-f3-an-tam-7-play4s.jpg",
  "Super300 Biz Plus.jpg": "super300-biz-plus.jpg",
  "Super300 Biz.jpg": "super300-biz.jpg",
  "Super500 Biz Plus.jpg": "super500-biz-plus.jpg",
  "Super500 Biz.jpg": "super500-biz.jpg",
  "Super600 Biz Plus.jpg": "super600-biz-plus.jpg",
  "Super600 Biz.jpg": "super600-biz.jpg",
  "Super800 Biz Plus.png": "super800-biz-plus.png",
  "Super800 Biz.png": "super800-biz.png",
};

const files = fs.readdirSync(srcDir);
let count = 0;

for (const file of files) {
  const srcFile = path.join(srcDir, file);
  if (!fs.statSync(srcFile).isFile()) continue;

  // Copy to packages folder with original name
  const destOrig = path.join(destPackagesDir, file);
  fs.copyFileSync(srcFile, destOrig);

  // Copy with slug name
  const slug = MAP[file];
  if (slug) {
    const destSlug = path.join(destPackagesDir, slug);
    fs.copyFileSync(srcFile, destSlug);

    // Also copy to main folder for easy fallback
    const destMain = path.join(destMainDir, slug);
    fs.copyFileSync(srcFile, destMain);
  }
  count++;
}

console.log(`Copied and normalized ${count} package images successfully.`);
