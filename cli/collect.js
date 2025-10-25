#!/usr/bin/env node

/**
 * CLI utilitário para orquestrar a coleta de artigos.
 *
 * Quando executado com a opção `--all` e a flag `--audit-listing-html`,
 * a ferramenta baixa o HTML da primeira página de listagem e salva o
 * conteúdo para auditoria.
 */

const { parseArgs } = require('node:util');
const fs = require('node:fs/promises');
const path = require('node:path');
const process = require('node:process');

const DEFAULT_AUDIT_DIR = path.join('audits', 'listing-pages');

function usage() {
  return `
Uso: node cli/collect.js collect --all [opções]

Comandos:
  collect            Executa a coleta de artigos.

Opções:
  --all, -a          Coleta todas as fontes configuradas.
  --audit-listing-html
                     Baixa e salva o HTML da primeira página de listagem
                     para auditoria.
  --listing-url=<url>
                     URL da página de listagem para salvar (pode ser
                     definida via variável de ambiente COLLECT_LISTING_URL).
  --audit-output=<caminho>
                     Diretório onde o HTML será salvo. Padrão:
                     ${DEFAULT_AUDIT_DIR}.
  --help, -h         Mostra esta mensagem de ajuda.
`; }

async function ensureListingHtmlAudit(options) {
  const listingUrl = options.listingUrl ?? process.env.COLLECT_LISTING_URL;

  if (!listingUrl) {
    throw new Error(
      'A opção --listing-url (ou a variável COLLECT_LISTING_URL) é obrigatória para salvar a página de listagem.'
    );
  }

  const response = await fetch(listingUrl, {
    headers: {
      'user-agent': 'pi-senac-collector/1.0 (+https://github.com/DevSolto)'.slice(0, 128),
      accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao baixar a página de listagem (${response.status} ${response.statusText})`
    );
  }

  const html = await response.text();
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const outputDir = path.resolve(process.cwd(), options.auditOutput ?? DEFAULT_AUDIT_DIR);
  const fileName = `listing-${timestamp}.html`;
  const filePath = path.join(outputDir, fileName);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');

  console.log(`HTML da listagem salvo em: ${filePath}`);
  return filePath;
}

async function runCollectAll() {
  try {
    const modulePath = path.resolve(__dirname, 'collect-all');
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const maybeModule = require(modulePath);

    if (typeof maybeModule.collectAll === 'function') {
      await maybeModule.collectAll();
      return;
    }

    console.warn(
      'Módulo collect-all não exporta uma função collectAll. Nenhuma coleta adicional foi executada.'
    );
  } catch (error) {
    if (error && error.code === 'MODULE_NOT_FOUND') {
      console.warn(
        'Nenhum módulo collect-all encontrado. Adicione um arquivo cli/collect-all.js com a função collectAll se necessário.'
      );
      return;
    }

    throw error;
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      all: { type: 'boolean', short: 'a' },
      'audit-listing-html': { type: 'boolean' },
      'listing-url': { type: 'string' },
      'audit-output': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });

  const command = positionals[0] ?? 'collect';

  if (values.help) {
    console.log(usage());
    return;
  }

  if (!['collect', 'coletar'].includes(command)) {
    console.error(`Comando desconhecido: ${command}`);
    console.log(usage());
    process.exitCode = 1;
    return;
  }

  if (!values.all) {
    console.error('A flag --all é obrigatória para o modo de coleta total.');
    process.exitCode = 1;
    return;
  }

  if (values['audit-listing-html']) {
    try {
      await ensureListingHtmlAudit({
        listingUrl: values['listing-url'],
        auditOutput: values['audit-output'],
      });
    } catch (error) {
      console.error(`Não foi possível salvar o HTML da listagem: ${error.message}`);
      process.exitCode = 1;
      return;
    }
  }

  await runCollectAll();
}

main().catch((error) => {
  console.error('Erro inesperado ao executar a coleta:', error);
  process.exit(1);
});

