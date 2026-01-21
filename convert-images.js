const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'images');

fs.readdir(imagesDir, (err, files) => {
    if (err) {
        return console.error('Unable to scan directory: ' + err);
    }

    files.forEach((file) => {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            const inputFile = path.join(imagesDir, file);
            const outputFile = path.join(imagesDir, path.basename(file, ext) + '.webp');

            sharp(inputFile)
                .webp({ quality: 80 })
                .toFile(outputFile)
                .then(() => {
                    console.log(`Converted: ${file} -> ${path.basename(outputFile)}`);
                    // Optional: Delete original? No, safest to keep for now unless user confirms.
                    // But user goal is "make site light", so we should switch references.
                    // We will keep originals for backup but use webp in code.
                })
                .catch(err => {
                    console.error(`Error converting ${file}:`, err);
                });
        }
    });
});
