const fs = require('fs');
const path = require('path');
const axios = require('axios');
const download = require('image-downloader');

// Configuration
const PLANTS_JSON = path.join(__dirname, 'src', 'json', 'PlantsList.json');
const IMAGES_DIR = path.join(__dirname, 'public', 'images', 'plants');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Read plants data
const plantsData = JSON.parse(fs.readFileSync(PLANTS_JSON, 'utf8'));

// Find plants missing images
const missingImages = [];
plantsData.forEach(plant => {
    const imgPath = plant.Imgpath;
    if (imgPath && imgPath !== './images/plants/default.jpg') {
        const filename = path.basename(imgPath);
        const fullPath = path.join(IMAGES_DIR, filename);
        if (!fs.existsSync(fullPath)) {
            missingImages.push({
                id: plant.id,
                name: plant.Name,
                slug: plant.slug,
                filename: filename,
                searchTerm: `${plant.Name} plant`
            });
        }
    }
});

console.log(`Found ${missingImages.length} plants missing images\n`);

// Function to search and download images from Pixabay (free API)
async function downloadPlantImage(plant) {
    const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || 'YOUR_API_KEY_HERE';
    const searchTerm = encodeURIComponent(plant.searchTerm);
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${searchTerm}&image_type=photo&per_page=3`;

    try {
        console.log(`Searching for: ${plant.name}`);

        if (PIXABAY_API_KEY === 'YOUR_API_KEY_HERE') {
            console.log(`  ⚠️  Skipping ${plant.filename} - No API key configured`);
            console.log(`     Manual search: https://pixabay.com/images/search/${encodeURIComponent(plant.searchTerm)}/`);
            return false;
        }

        const response = await axios.get(url);
        const data = response.data;

        if (data.hits && data.hits.length > 0) {
            const imageUrl = data.hits[0].largeImageURL;
            const dest = path.join(IMAGES_DIR, plant.filename);

            await download.image({
                url: imageUrl,
                dest: dest
            });

            console.log(`  ✅ Downloaded ${plant.filename}`);
            return true;
        } else {
            console.log(`  ❌ No images found for ${plant.name}`);
            return false;
        }
    } catch (error) {
        console.error(`  ❌ Error downloading ${plant.filename}:`, error.message);
        return false;
    }
}

// Download images with delay to avoid rate limits
async function downloadAllImages() {
    console.log('Starting automated image download...\n');

    for (let i = 0; i < missingImages.length; i++) {
        const plant = missingImages[i];
        const success = await downloadPlantImage(plant);

        // Progress indicator
        console.log(`Progress: ${i + 1}/${missingImages.length}\n`);

        // Delay between requests to be respectful to the API
        if (i < missingImages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('Image download process completed!');
    console.log(`Check the ${IMAGES_DIR} directory for downloaded images.`);
}

// Generate manual download guide
function generateManualGuide() {
    const guidePath = path.join(__dirname, 'MANUAL_IMAGE_DOWNLOAD.md');

    let content = '# Manual Plant Image Download Guide\n\n';
    content += `Found ${missingImages.length} plants missing images.\n\n`;
    content += '## Recommended Free Image Sources:\n\n';
    content += '1. **Pixabay** (https://pixabay.com) - Free stock photos\n';
    content += '2. **Unsplash** (https://unsplash.com) - Free high-quality photos\n';
    content += '3. **Pexels** (https://pexels.com) - Free stock photos\n';
    content += '4. **Wikimedia Commons** (https://commons.wikimedia.org) - Public domain images\n\n';
    content += '## Plants Needing Images:\n\n';

    missingImages.forEach(plant => {
        content += `### ${plant.name} (ID: ${plant.id})\n`;
        content += `- **Filename:** \`${plant.filename}\`\n`;
        content += `- **Search terms:** "${plant.searchTerm}"\n`;
        content += `- **Save location:** \`public/images/plants/${plant.filename}\`\n`;
        content += `- **Quick search links:**\n`;
        content += `  - Pixabay: https://pixabay.com/images/search/${encodeURIComponent(plant.searchTerm)}/\n`;
        content += `  - Unsplash: https://unsplash.com/s/photos/${encodeURIComponent(plant.searchTerm)}\n`;
        content += `  - Pexels: https://www.pexels.com/search/${encodeURIComponent(plant.searchTerm)}/\n\n`;
    });

    fs.writeFileSync(guidePath, content);
    console.log(`Generated manual download guide: ${guidePath}`);
}

// Run the process
if (require.main === module) {
    generateManualGuide();

    if (process.argv.includes('--auto')) {
        console.log('Running automated download...\n');
        downloadAllImages();
    } else {
        console.log('Run with --auto flag to attempt automated downloads');
        console.log('Example: node download_images.js --auto\n');
        console.log('For automated downloads, you need to:');
        console.log('1. Get a free API key from https://pixabay.com/api/docs/');
        console.log('2. Set environment variable: PIXABAY_API_KEY=your_key_here');
        console.log('3. Run: node download_images.js --auto');
    }
}

module.exports = { downloadAllImages, generateManualGuide };