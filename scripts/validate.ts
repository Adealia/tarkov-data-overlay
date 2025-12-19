import Ajv from 'ajv';
import JSON5 from 'json5';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const SRC_DIR = join(ROOT_DIR, 'src');
const SCHEMAS_DIR = join(SRC_DIR, 'schemas');

interface ValidationResult {
  file: string;
  valid: boolean;
  errors?: string[];
}

function loadJson5File(filePath: string): unknown {
  const content = readFileSync(filePath, 'utf-8');
  return JSON5.parse(content);
}

function loadJsonFile(filePath: string): unknown {
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function validateSourceFiles(): ValidationResult[] {
  const results: ValidationResult[] = [];
  const ajv = new Ajv({ allErrors: true, strict: false });

  // Load schemas
  const taskSchema = loadJsonFile(join(SCHEMAS_DIR, 'task-override.schema.json'));
  const editionSchema = loadJsonFile(join(SCHEMAS_DIR, 'edition.schema.json'));

  const validateTask = ajv.compile(taskSchema as object);
  const validateEdition = ajv.compile(editionSchema as object);

  // Validate overrides
  const overridesDir = join(SRC_DIR, 'overrides');
  if (existsSync(overridesDir)) {
    const files = readdirSync(overridesDir).filter(f => f.endsWith('.json5'));

    for (const file of files) {
      const filePath = join(overridesDir, file);
      try {
        const data = loadJson5File(filePath);

        // Skip empty objects
        if (Object.keys(data as object).length === 0) {
          results.push({ file: `overrides/${file}`, valid: true });
          continue;
        }

        let valid = true;
        const errors: string[] = [];

        if (file === 'tasks.json5') {
          valid = validateTask(data) as boolean;
          if (!valid && validateTask.errors) {
            errors.push(...validateTask.errors.map(e => `${e.instancePath}: ${e.message}`));
          }
        }
        // Add more validators as needed

        results.push({ file: `overrides/${file}`, valid, errors: errors.length > 0 ? errors : undefined });
      } catch (error) {
        results.push({
          file: `overrides/${file}`,
          valid: false,
          errors: [(error as Error).message]
        });
      }
    }
  }

  // Validate additions
  const additionsDir = join(SRC_DIR, 'additions');
  if (existsSync(additionsDir)) {
    const files = readdirSync(additionsDir).filter(f => f.endsWith('.json5'));

    for (const file of files) {
      const filePath = join(additionsDir, file);
      try {
        const data = loadJson5File(filePath);

        let valid = true;
        const errors: string[] = [];

        if (file === 'editions.json5') {
          valid = validateEdition(data) as boolean;
          if (!valid && validateEdition.errors) {
            errors.push(...validateEdition.errors.map(e => `${e.instancePath}: ${e.message}`));
          }
        }

        results.push({ file: `additions/${file}`, valid, errors: errors.length > 0 ? errors : undefined });
      } catch (error) {
        results.push({
          file: `additions/${file}`,
          valid: false,
          errors: [(error as Error).message]
        });
      }
    }
  }

  return results;
}

function main(): void {
  console.log('Validating source files...\n');

  const results = validateSourceFiles();
  let hasErrors = false;

  for (const result of results) {
    if (result.valid) {
      console.log(`✅ ${result.file}`);
    } else {
      console.log(`❌ ${result.file}`);
      if (result.errors) {
        for (const error of result.errors) {
          console.log(`   ${error}`);
        }
      }
      hasErrors = true;
    }
  }

  console.log('');

  if (hasErrors) {
    console.log('Validation failed!');
    process.exit(1);
  } else {
    console.log('All files valid!');
  }
}

main();
