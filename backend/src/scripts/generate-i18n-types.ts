import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, parse, relative } from 'node:path';

interface TranslationTree {
  [key: string]: string | TranslationTree;
}

function readJsonTree(rootPath: string): TranslationTree {
  const tree: TranslationTree = {};

  for (const entry of readdirSync(rootPath, { withFileTypes: true })) {
    const entryPath = join(rootPath, entry.name);

    if (entry.isDirectory()) {
      tree[entry.name] = readJsonTree(entryPath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue;
    }

    const fileName = parse(entry.name).name;
    const fileContent = readFileSync(entryPath, 'utf8');

    tree[fileName] = JSON.parse(fileContent) as TranslationTree;
  }

  return tree;
}

async function generateI18nTypes(): Promise<void> {
  const sourceLanguagePath = join(process.cwd(), 'src', 'i18n', 'en');
  const outputPath = join(process.cwd(), 'src', 'generated', 'i18n.generated.ts');

  if (!existsSync(sourceLanguagePath)) {
    throw new Error(`Missing i18n source folder: ${relative(process.cwd(), sourceLanguagePath)}`);
  }

  const translations = readJsonTree(sourceLanguagePath);
  // nestjs-i18n does not expose this utility via public typings.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const typescriptUtils = require('nestjs-i18n/dist/utils/typescript') as {
    createTypesFile: (translations: TranslationTree) => Promise<string | undefined>;
    annotateSourceCode: (source: string) => string;
  };
  const rawContent = await typescriptUtils.createTypesFile(translations);

  if (!rawContent) {
    throw new Error('Failed to generate i18n types');
  }

  mkdirSync(parse(outputPath).dir, { recursive: true });
  writeFileSync(outputPath, typescriptUtils.annotateSourceCode(rawContent));
}

void generateI18nTypes();
