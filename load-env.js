const fs = require('node:fs');
const path = require('node:path');

let isLoaded = false;

const DEFAULT_MODE = process.env.NODE_ENV || 'development';

const LINE_REGEX = /^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)?\s*$/;

function parseEnvFile(contents) {
  const result = {};
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(LINE_REGEX);
    if (!match) {
      continue;
    }

    const key = match[1];
    let value = match[2] ?? '';

    // Remove inline comments that follow an unquoted value
    const hasQuotes = value.startsWith('"') || value.startsWith("'");
    if (!hasQuotes) {
      const hashIndex = value.indexOf(' #');
      if (hashIndex >= 0) {
        value = value.slice(0, hashIndex);
      }
    }

    value = value.trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    value = value.replace(/\\n/g, '\n');
    result[key] = value;
  }

  return result;
}

function applyEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    const contents = fs.readFileSync(filePath, 'utf8');
    const parsed = parseEnvFile(contents);

    for (const [key, value] of Object.entries(parsed)) {
      process.env[key] = value;
    }

    return true;
  } catch (error) {
    console.warn(`[env] Falha ao carregar ${filePath}:`, error.message);
    return false;
  }
}

function buildEnvFileList(mode, cwd) {
  return [
    path.join(cwd, '.env'),
    path.join(cwd, '.env.local'),
    path.join(cwd, `.env.${mode}`),
    path.join(cwd, `.env.${mode}.local`),
  ];
}

function loadEnv(options = {}) {
  const mode = options.mode || DEFAULT_MODE;
  const cwd = options.cwd || process.cwd();

  if (isLoaded && !options.force) {
    return process.env;
  }

  const files = buildEnvFileList(mode, cwd);
  for (const filePath of files) {
    applyEnvFile(filePath);
  }

  isLoaded = true;
  return process.env;
}

module.exports = { loadEnv };
