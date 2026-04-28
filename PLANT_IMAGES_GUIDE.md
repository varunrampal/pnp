# Plant Image Download Guide for PNP Nursery 🌱

## Current Status
- **Total plants in database:** 1,183
- **Images already available:** ~25 plants
- **Images needed:** ~1,158 plants

## Method 1: Manual Download (Recommended for Quality Control)

### Step-by-Step Process:

1. **Open the CSV file:** `plants_needing_images.csv`
2. **For each plant, search on free stock photo sites:**
   - **Pixabay** (https://pixabay.com) - Best for plants
   - **Unsplash** (https://unsplash.com) - High quality
   - **Pexels** (https://pexels.com) - Good variety
   - **Wikimedia Commons** (https://commons.wikimedia.org) - Public domain

3. **Download criteria:**
   - Clear, well-lit photos
   - Plant should be the main subject
   - Prefer photos showing the plant in natural settings
   - Avoid copyrighted or watermarked images

4. **Save location:** `public/images/plants/[filename]`
   - Example: `public/images/plants/buxus-green-gem.jpg`

### Quick Search Links for Top Missing Plants:

**Buxus Green Gem** (ID: 2)
- Pixabay: https://pixabay.com/images/search/buxus%20green%20gem%20plant/
- Save as: `buxus-green-gem.jpg`

**Taxus x media 'Hillii'** (ID: 3)
- Pixabay: https://pixabay.com/images/search/taxus%20x%20media%20hillii%20plant/
- Save as: `taxus-x-media-hillii.jpg`

**Lonicera lagostim lemon beauty** (ID: 4)
- Pixabay: https://pixabay.com/images/search/lonicera%20lagostim%20lemon%20beauty%20plant/
- Save as: `lonicera-lagostim-lemon-beauty.jpg`

## Method 2: Automated Download (Requires API Setup)

### Prerequisites:
1. Get a free API key from Pixabay: https://pixabay.com/api/docs/
2. Install dependencies: `npm install axios image-downloader`

### Setup Environment Variable:
```bash
# Windows PowerShell
$env:PIXABAY_API_KEY="your_api_key_here"

# Or create .env file
echo "PIXABAY_API_KEY=your_api_key_here" > .env
```

### Run Automated Download:
```bash
node download_images.js --auto
```

## Method 3: Bulk Download Tools

### Using PowerShell Script:
```powershell
# Create a bulk download script
$plants = Get-Content "plants_needing_images.csv" | ConvertFrom-Csv
foreach ($plant in $plants) {
    $searchUrl = "https://pixabay.com/images/search/$([uri]::EscapeDataString($plant.Search_Term))/"
    Start-Process $searchUrl
    Read-Host "Press Enter after downloading $($plant.Image_Filename)"
}
```

## Image Specifications

### Recommended:
- **Format:** JPG or WebP
- **Size:** 800x600px minimum, 1200x900px ideal
- **Quality:** High resolution, clear focus
- **Aspect Ratio:** 4:3 or 16:9 preferred

### File Naming:
- Use the exact filename from `Imgpath` field in JSON
- Example: `taxus-brevifolia.jpg`
- Keep consistent with slug naming convention

## Quality Guidelines

### ✅ Good Images:
- Clear, focused photos
- Plant is main subject
- Good lighting
- Natural background preferred
- No text overlays or watermarks

### ❌ Avoid:
- Blurry or low-quality photos
- Plants that are not the main subject
- Copyrighted images
- Images with text/logos
- Stock photos with obvious watermarks

## Progress Tracking

After downloading images, you can check progress by running:
```bash
# Count images in directory
Get-ChildItem "public/images/plants/" -File | Measure-Object | Select-Object Count

# Find still missing images
node download_images.js
```

## Tips for Success

1. **Start with common plants** - Easier to find good images
2. **Use scientific names** - More likely to find accurate matches
3. **Check multiple sources** - Different sites have different photos
4. **Batch download** - Work in groups of 10-20 plants at a time
5. **Quality over quantity** - Better to have fewer good images than many poor ones

## Need Help?

If you need assistance with any of these methods, let me know! I can help you:
- Set up automated downloads
- Create custom search scripts
- Organize your image library
- Optimize images for web performance