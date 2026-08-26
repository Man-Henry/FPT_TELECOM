@echo off
echo Dang kiem tra va chuan bi day code len GitHub...
git add .
git commit -m "Don dep code sach se, toi uu hoa tai nguyen va he thong"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Man-Henry/FPT_TELECOM.git
echo Dang day code len GitHub...
git push -u -f origin main
echo Hoan thanh day code!
pause
