const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '_data');
const layoutsDir = path.join(__dirname, '_includes');
const rootDir = __dirname;

const filesToUpdate = [];

// Helper to scan directory
function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) return; // Don't match recursively for now unless needed
        if (filePath.endsWith('.json') || filePath.endsWith('.njk') || filePath.endsWith('.html')) {
            filesToUpdate.push(filePath);
        }
    });
}

// Data files
scanDir(dataDir);
// Root templates
fs.readdirSync(rootDir).forEach(file => {
    if (file.endsWith('.njk')) filesToUpdate.push(path.join(rootDir, file));
});

filesToUpdate.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let updated = false;

    // Replace image extensions
    // Note: We use regex that looks for typical image paths
    const regex = /(\/images\/[^"'\s]+)\.(jpg|jpeg|png)/gi;

    if (regex.test(content)) {
        content = content.replace(regex, '$1.webp');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated references in: ${path.basename(file)}`);
    }
});
