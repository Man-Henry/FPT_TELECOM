import os
import re
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKAGES_DIR = os.path.join(BASE_DIR, 'assets', 'images', 'packages')
MAIN_DIR = os.path.join(BASE_DIR, 'assets', 'images', 'main')

def convert_image(src_path, dest_path, max_width=800, quality=82):
    try:
        with Image.open(src_path) as im:
            if im.mode in ('RGBA', 'LA'):
                pass
            elif im.mode != 'RGB':
                im = im.convert('RGB')
            w, h = im.size
            if w > max_width:
                new_h = int(h * (max_width / w))
                im = im.resize((max_width, new_h), Image.Resampling.LANCZOS)
            im.save(dest_path, 'WEBP', quality=quality, method=6)
            return True
    except Exception as e:
        print(f"Error converting {src_path}: {e}")
        return False

print("Scanning assets/images/packages for JPG and PNG images...")
files = [f for f in os.listdir(PACKAGES_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
print(f"Found {len(files)} images to convert to WebP.")

total_orig = 0
total_webp = 0
converted_count = 0

for filename in files:
    src_file = os.path.join(PACKAGES_DIR, filename)
    orig_size = os.path.getsize(src_file)
    total_orig += orig_size
    
    base_name, _ = os.path.splitext(filename)
    dest_webp = os.path.join(PACKAGES_DIR, f"{base_name}.webp")
    
    if convert_image(src_file, dest_webp):
        webp_size = os.path.getsize(dest_webp)
        total_webp += webp_size
        converted_count += 1
        
        # Also copy to assets/images/main if it's a slug name
        if not any(c in base_name for c in [' ', 'á', 'à', 'ả', 'ã', 'ạ', 'ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ', 'â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ', 'é', 'è', 'ẻ', 'ẽ', 'ẹ', 'ê', 'ế', 'ề', 'ể', 'ễ', 'ệ', 'í', 'ì', 'ỉ', 'ĩ', 'ị', 'ó', 'ò', 'ỏ', 'õ', 'ọ', 'ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ', 'ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ', 'ú', 'ù', 'ủ', 'ũ', 'ụ', 'ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ', 'đ']):
            main_dest = os.path.join(MAIN_DIR, f"{base_name}.webp")
            convert_image(src_file, main_dest)

print("\n" + "="*50)
print(f"Converted {converted_count} images to WebP.")
print(f"Original total: {total_orig / (1024*1024):.2f} MB")
print(f"WebP total: {total_webp / (1024*1024):.2f} MB")
if total_orig > 0:
    print(f"Bandwidth saved: {((1 - total_webp / total_orig) * 100):.1f}%!")
print("="*50)
