import JSON5 from 'json5';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const SRC_DIR = join(ROOT_DIR, 'src');
const DIST_DIR = join(ROOT_DIR, 'dist');

interface OverlayOutput {
  tasks?: Record<string, unknown>;
  items?: Record<string, unknown>;
  traders?: Record<string, unknown>;
  hideout?: Record<string, unknown>;
  editions?: Record<string, unknown>;
  $meta: {
    version: string;
    generated: string;
    sha256?: string;
  };
}

function loadJson5File(filePath: string): Record<string, unknown> {
  const content = readFileSync(filePath, 'utf-8');
  return JSON5.parse(content) as Record<string, unknown>;
}

function loadSourceFiles(): Omit<OverlayOutput, '$meta'> {
  const output: Omit<OverlayOutput, '$meta'> = {};

  // Load overrides
  const overridesDir = join(SRC_DIR, 'overrides');
  if (existsSync(overridesDir)) {
    const files = readdirSync(overridesDir).filter(f => f.endsWith('.json5'));

    for (const file of files) {
      const filePath = join(overridesDir, file);
      const data = loadJson5File(filePath);

      // Skip empty objects
      if (Object.keys(data).length === 0) continue;

      const key = file.replace('.json5', '') as keyof Omit<OverlayOutput, '$meta'>;
      output[key] = data;
    }
  }

  // Load additions
  const additionsDir = join(SRC_DIR, 'additions');
  if (existsSync(additionsDir)) {
    const files = readdirSync(additionsDir).filter(f => f.endsWith('.json5'));

    for (const file of files) {
      const filePath = join(additionsDir, file);
      const data = loadJson5File(filePath);

      const key = file.replace('.json5', '') as keyof Omit<OverlayOutput, '$meta'>;
      output[key] = data;
    }
  }

  return output;
}

function getVersion(): string {
  const packageJson = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf-8'));
  return packageJson.version;
}

function generateSha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function build(): void {
  console.log('Building overlay...\n');

  // Load all source files
  const data = loadSourceFiles();

  // Create output with metadata
  const output: OverlayOutput = {
    ...data,
    $meta: {
      version: getVersion(),
      generated: new Date().toISOString()
    }
  };

  // Generate JSON output (without sha256 first)
  const jsonContent = JSON.stringify(output, null, 2);

  // Add sha256 of the data (excluding $meta.sha256)
  output.$meta.sha256 = generateSha256(jsonContent);

  // Final output with sha256
  const finalContent = JSON.stringify(output, null, 2);

  // Ensure dist directory exists
  if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR, { recursive: true });
  }

  // Write output
  const outputPath = join(DIST_DIR, 'overlay.json');
  writeFileSync(outputPath, finalContent);

  // Summary
  const entityCounts = Object.entries(data)
    .filter(([key]) => key !== '$meta')
    .map(([key, value]) => `${key}: ${Object.keys(value as object).length}`)
    .join(', ');

  console.log(`✅ Built overlay.json`);
  console.log(`   Entities: ${entityCounts}`);
  console.log(`   Version: ${output.$meta.version}`);
  console.log(`   Generated: ${output.$meta.generated}`);
  console.log(`   SHA256: ${output.$meta.sha256?.substring(0, 16)}...`);
  console.log(`\nOutput: ${outputPath}`);
}

build();
