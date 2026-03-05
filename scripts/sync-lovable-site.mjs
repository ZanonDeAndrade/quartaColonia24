import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const targetDir = path.join(rootDir, 'quarta-colonia');
const sourceCandidates = [
  path.join(rootDir, 'lovable_original'),
  path.join(rootDir, 'visual-code-creator-main'),
  path.join(rootDir, 'visual-code-creator'),
  path.join(rootDir, 'lovable_original-main')
];

const mustExist = (targetPath, label) => {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`[sync-lovable] Missing ${label}: ${targetPath}`);
  }
};

const resolveSourceDir = () => {
  for (const candidate of sourceCandidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
};

const copyAndReplace = (from, to) => {
  if (!fs.existsSync(from)) return;
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
};

const copyFile = (from, to) => {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};

const findFileByName = (dirPath, fileName) => {
  if (!fs.existsSync(dirPath)) return null;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isFile() && entry.name === fileName) return fullPath;
    if (entry.isDirectory()) {
      const nested = findFileByName(fullPath, fileName);
      if (nested) return nested;
    }
  }
  return null;
};

const syncPackageDependencies = (sourceDir) => {
  const sourcePackagePath = path.join(sourceDir, 'package.json');
  const targetPackagePath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(sourcePackagePath) || !fs.existsSync(targetPackagePath)) return;

  const sourcePackage = JSON.parse(fs.readFileSync(sourcePackagePath, 'utf8'));
  const targetPackage = JSON.parse(fs.readFileSync(targetPackagePath, 'utf8'));

  targetPackage.dependencies = {
    ...(sourcePackage.dependencies ?? {}),
    ...(targetPackage.dependencies ?? {}),
    '@repo/api': '*',
    '@repo/ui': '*'
  };

  targetPackage.devDependencies = {
    ...(sourcePackage.devDependencies ?? {}),
    ...(targetPackage.devDependencies ?? {})
  };

  fs.writeFileSync(targetPackagePath, `${JSON.stringify(targetPackage, null, 2)}\n`, 'utf8');
};

const writeTailwindCompatConfig = () => {
  const compatPath = path.join(targetDir, 'tailwind.config.cjs');
  const source = `const preset = require('@repo/ui/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    '../packages/ui/**/*.{js,jsx,ts,tsx,css}',
    '../packages/api/**/*.{js,jsx,ts,tsx}'
  ]
};
`;
  fs.writeFileSync(compatPath, source, 'utf8');
};

const writePostcssCompatConfig = () => {
  const legacyJsPath = path.join(targetDir, 'postcss.config.js');
  if (fs.existsSync(legacyJsPath)) {
    fs.rmSync(legacyJsPath, { force: true });
  }

  const postcssPath = path.join(targetDir, 'postcss.config.cjs');
  const source = `module.exports = {
  plugins: {
    tailwindcss: {
      config: './tailwind.config.cjs'
    },
    autoprefixer: {}
  }
};
`;
  fs.writeFileSync(postcssPath, source, 'utf8');
};

const ensureMainBootstrapsNewsData = () => {
  const mainTsxPath = path.join(targetDir, 'src', 'main.tsx');
  const dataFilePath = findFileByName(path.join(targetDir, 'src'), 'newsData.ts');
  if (!fs.existsSync(mainTsxPath) || !dataFilePath) return;

  const rawRelativeImport = path
    .relative(path.dirname(mainTsxPath), dataFilePath)
    .replace(/\\/g, '/')
    .replace(/\.ts$/, '');
  const relativeImport = rawRelativeImport.startsWith('.') ? rawRelativeImport : `./${rawRelativeImport}`;

  const content = fs.readFileSync(mainTsxPath, 'utf8');
  if (content.includes(`import '${relativeImport}'`) || content.includes(`import "${relativeImport}"`)) return;

  const next = `import '${relativeImport}';\n${content}`;
  fs.writeFileSync(mainTsxPath, next, 'utf8');
};

const createNewsDataAdapter = () => {
  const targetNewsDataPath = findFileByName(path.join(targetDir, 'src'), 'newsData.ts');
  if (!targetNewsDataPath) return;

  const dataDir = path.dirname(targetNewsDataPath);
  const originalSource = fs.readFileSync(targetNewsDataPath, 'utf8');
  const originalPath = path.join(dataDir, 'newsData.original.ts');
  fs.writeFileSync(originalPath, originalSource, 'utf8');

  const hasDefaultExport = /export\s+default\s+/m.test(originalSource);

  const adapterSource = `
import * as legacy from './newsData.original';
export * from './newsData.original';
${hasDefaultExport ? "export { default } from './newsData.original';" : ''}

type ApiNewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  status?: string;
  coverUrl?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ApiNewsResponse = {
  items?: ApiNewsItem[];
};

const API_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000';

const toDateLabel = (value?: string | null) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const mapApiToLegacy = (item: ApiNewsItem, index: number) => ({
  id: item.id ?? String(index + 1),
  slug: item.slug ?? '',
  title: item.title ?? '',
  excerpt: item.excerpt ?? '',
  content: item.content ?? '',
  category: item.category ?? 'Geral',
  image: item.coverUrl ?? '',
  publishedAt: item.publishedAt ?? null,
  date: toDateLabel(item.publishedAt),
  tags: Array.isArray(item.tags) ? item.tags : [],
  status: item.status ?? 'published'
});

const getArrayExports = () =>
  Object.entries(legacy).filter(([, value]) => Array.isArray(value)) as Array<[string, any[]]>;

const pickNewsArray = (arrays: Array<[string, any[]]>): [string, any[]] | null => {
  const names = ['newsData', 'news', 'articles', 'posts', 'allNews', 'latestNews'];
  for (const name of names) {
    const found = arrays.find(([key]) => key.toLowerCase() === name.toLowerCase());
    if (found) return found;
  }
  return arrays[0] ?? null;
};

const updateCategoryArrays = (arrays: Array<[string, any[]]>, mappedItems: any[]) => {
  const categories = Array.from(
    new Set(
      mappedItems
        .map((item) => String(item.category || '').trim())
        .filter(Boolean)
    )
  );

  arrays.forEach(([key, arr]) => {
    if (!Array.isArray(arr)) return;
    const lowered = key.toLowerCase();
    if (!lowered.includes('categor')) return;
    arr.splice(0, arr.length, ...categories);
  });
};

const hydrateFromApi = async () => {
  try {
    const response = await fetch(\`\${API_URL}/api/news\`);
    if (!response.ok) return;

    const payload = (await response.json()) as ApiNewsResponse;
    const items = Array.isArray(payload.items) ? payload.items : [];
    const mapped = items.map(mapApiToLegacy);

    const arrays = getArrayExports();
    const newsArrayEntry = pickNewsArray(arrays);
    if (!newsArrayEntry) return;

    const [, targetArray] = newsArrayEntry;
    targetArray.splice(0, targetArray.length, ...mapped);
    updateCategoryArrays(arrays, mapped);
  } catch {
    // Falha de rede/API não deve quebrar o layout original.
  }
};

void hydrateFromApi();
`;

  fs.writeFileSync(targetNewsDataPath, adapterSource.trimStart(), 'utf8');
};

const run = () => {
  mustExist(targetDir, 'target directory "quarta-colonia"');
  const sourceDir = resolveSourceDir();

  if (!sourceDir) {
    console.warn(
      `[sync-lovable] source not found. Looked for: ${sourceCandidates.join(', ')}. Skipping sync.`
    );
    return;
  }

  const sourceSrcDir = path.join(sourceDir, 'src');
  const targetSrcDir = path.join(targetDir, 'src');
  if (!fs.existsSync(sourceSrcDir)) {
    console.warn(`[sync-lovable] source found at ${sourceDir}, but missing src/. Skipping sync.`);
    return;
  }

  copyAndReplace(sourceSrcDir, targetSrcDir);
  copyFile(path.join(sourceDir, 'tailwind.config.ts'), path.join(targetDir, 'tailwind.config.ts'));
  copyFile(path.join(sourceDir, 'components.json'), path.join(targetDir, 'components.json'));
  copyFile(path.join(sourceDir, 'postcss.config.js'), path.join(targetDir, 'postcss.config.cjs'));
  copyFile(path.join(sourceDir, 'index.html'), path.join(targetDir, 'index.html'));
  copyFile(
    path.join(sourceDir, 'src', 'assets', 'hero-city.jpg'),
    path.join(targetDir, 'src', 'assets', 'hero-city.jpg')
  );

  syncPackageDependencies(sourceDir);
  writeTailwindCompatConfig();
  writePostcssCompatConfig();
  createNewsDataAdapter();
  ensureMainBootstrapsNewsData();

  console.log('[sync-lovable] Quarta-colonia synchronized from lovable_original.');
};

run();
