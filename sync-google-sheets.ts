import { googleSheetsService } from './src/services/googleSheets';
import logger from './src/utils/logger';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

// Путь к файлу с лидами
const EXCEL_FILE_PATH = path.join(process.cwd(), 'leads.xlsx');

// Путь к файлу с учетными данными Google
const CREDENTIALS_PATH = path.join(process.cwd(), 'google-credentials.json');

/**
 * Запрос ID таблицы у пользователя
 */
async function askForSpreadsheetId(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter Google Sheets ID (or full URL): ', (answer) => {
      rl.close();
      
      // Если введен URL, извлекаем ID
      if (answer.includes('docs.google.com')) {
        const match = answer.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
          resolve(match[1]);
          return;
        }
      }
      
      resolve(answer.trim());
    });
  });
}

/**
 * Главная функция синхронизации
 */
async function main() {
  try {
    logger.info('🚀 Starting Google Sheets synchronization...');
    logger.info('');

    // 1. Проверяем наличие Excel файла
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      logger.error(`❌ Excel file not found: ${EXCEL_FILE_PATH}`);
      logger.info('Please make sure leads.xlsx exists in the project root');
      process.exit(1);
    }

    logger.info(`✓ Found Excel file: ${EXCEL_FILE_PATH}`);

    // 2. Проверяем наличие файла с учетными данными
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      logger.error(`❌ Credentials file not found: ${CREDENTIALS_PATH}`);
      logger.info('');
      logger.info('Please follow these steps:');
      logger.info('1. Go to https://console.cloud.google.com');
      logger.info('2. Create a new project or select existing one');
      logger.info('3. Enable Google Sheets API');
      logger.info('4. Create Service Account credentials');
      logger.info('5. Download JSON key file and save as google-credentials.json');
      logger.info('');
      process.exit(1);
    }

    logger.info(`✓ Found credentials file`);

    // 3. Читаем учетные данные
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

    // 4. Запрашиваем ID таблицы
    logger.info('');
    const spreadsheetId = await askForSpreadsheetId();
    
    if (!spreadsheetId) {
      logger.error('❌ Spreadsheet ID is required');
      process.exit(1);
    }

    logger.info(`✓ Using spreadsheet ID: ${spreadsheetId}`);
    logger.info('');

    // 5. Инициализируем сервис
    await googleSheetsService.initialize(credentials, spreadsheetId);

    // 6. Запускаем синхронизацию
    logger.info('📊 Starting synchronization...');
    logger.info('This may take a while depending on the number of leads...');
    logger.info('');

    const stats = await googleSheetsService.syncFromExcel(EXCEL_FILE_PATH);

    // 7. Выводим результаты
    logger.info('');
    logger.info('═══════════════════════════════════════════');
    logger.info('           SYNCHRONIZATION RESULTS         ');
    logger.info('═══════════════════════════════════════════');
    logger.info(`📊 Total leads in Excel:    ${stats.total}`);
    logger.info(`✅ Successfully added:       ${stats.added}`);
    logger.info(`⚠️  Duplicates (skipped):    ${stats.duplicates}`);
    logger.info(`❌ Failed to add:            ${stats.failed}`);
    logger.info('═══════════════════════════════════════════');
    logger.info('');

    if (stats.added > 0) {
      logger.info(`✓ ${stats.added} new leads have been added to Google Sheets!`);
    }

    if (stats.duplicates > 0) {
      logger.info(`ℹ ${stats.duplicates} duplicate leads were skipped`);
    }

    if (stats.failed > 0) {
      logger.warn(`⚠ ${stats.failed} leads failed to add`);
    }

    logger.info('');
    logger.info('✓ Synchronization completed!');
    logger.info('You can now check your Google Sheets');

  } catch (error) {
    logger.error('❌ Synchronization failed:', error);
    process.exit(1);
  }
}

// Запускаем
main();
