// embed-imports.js
// This script generates import statements for all files in build/client
import { readdirSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const clientRoot = './build/client';
const imports = [];
const fileMap = [];

function scanDirectory(dir, basePath = '') {
  try {
    const files = readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = join(dir, file.name);
      const relativePath = join(basePath, file.name);

      if (file.isDirectory()) {
        scanDirectory(fullPath, relativePath);
      } else {
        // Skip non-static files
        if (file.name.endsWith('.map')) continue;

        try {
          const stats = statSync(fullPath);
          const importPath = `./${join(clientRoot, relativePath).replace(/\\/g, '/')}`;
          const varName = `file_${imports.length}`;
          const urlPath = `/${relativePath.replace(/\\/g, '/')}`;

          imports.push(`import ${varName} from "${importPath}" with { type: "file" };`);
          fileMap.push(`  "${urlPath}": ${varName},`);

          console.log(`Added: ${urlPath} (${stats.size} bytes)`);
        } catch (error) {
          console.error(`Error processing ${fullPath}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
}

console.log('Generating import statements...');
scanDirectory(clientRoot);

const content = `// Auto-generated imports for embedded files
${imports.join('\n')}

// Export file map for server usage
export const embeddedFileMap = {
${fileMap.join('\n')}
};

// This ensures all assets are embedded when compiling
console.log('Embedded ${imports.length} files');
`;

writeFileSync('./embedded-imports.js', content);

console.log(`\nGenerated ${imports.length} import statements in embedded-imports.js`);
console.log('Import this file in your server to embed all assets!');
