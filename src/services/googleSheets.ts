import { google } from 'googleapis';
import logger from '../utils/logger';
import ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

interface GoogleSheetsLead {
  leadName: string;
  contactName: string;
  position: string;
  transaction: string;
  phoneNumber: string;
  industryCategory: string;
  industryName: string;
  location: string;
  importedLocally: string; // Новая колонка для пометки локального импорта
}

interface ExcelLead {
  name: string;
  phone: string;
  category: string;
  channel: string;
  messageLink: string;
  originalMessage: string;
  date: string;
}

class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private auth: any;

  constructor() {
    this.spreadsheetId = '';
    this.sheets = null;
    this.auth = null;
  }

  /**
   * Инициализация Google Sheets API
   */
  async initialize(credentials: any, spreadsheetId: string) {
    try {
      this.spreadsheetId = spreadsheetId;

      // Создаем JWT клиент для аутентификации
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      logger.info('✓ Google Sheets API initialized');
    } catch (error) {
      logger.error('Failed to initialize Google Sheets API:', error);
      throw error;
    }
  }

  /**
   * Получить все существующие номера телефонов из Google Sheets
   * Проверка дубликатов ТОЛЬКО по номеру телефона
   */
  async getExistingPhones(): Promise<Set<string>> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Лист1!A2:I', // Читаем до колонки I (включая новую колонку Imported Locally)
      });

      const rows = response.data.values || [];
      const existingPhones = new Set<string>();

      for (const row of rows) {
        const phone = row[4] || ''; // Phone number в колонке E (индекс 4)
        
        if (phone) {
          // Нормализуем телефон и добавляем в Set
          const normalizedPhone = this.normalizePhone(phone);
          if (normalizedPhone) {
            existingPhones.add(normalizedPhone);
          }
        }
      }

      logger.info(`📊 Loaded ${existingPhones.size} unique phone numbers from Google Sheets`);
      return existingPhones;
    } catch (error) {
      logger.error('Failed to get existing phones from Google Sheets:', error);
      return new Set();
    }
  }

  /**
   * Нормализация телефона (удаляем все кроме цифр и +)
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
  }

  /**
   * Проверка на дубликат по номеру телефона
   */
  private isDuplicateByPhone(lead: GoogleSheetsLead, existingPhones: Set<string>): boolean {
    const normalizedPhone = this.normalizePhone(lead.phoneNumber);
    return existingPhones.has(normalizedPhone);
  }

  /**
   * Добавить лид в Google Sheets
   */
  async addLead(lead: GoogleSheetsLead): Promise<boolean> {
    try {
      const values = [
        [
          lead.leadName,
          lead.contactName,
          lead.position,
          lead.transaction,
          lead.phoneNumber,
          lead.industryCategory,
          lead.industryName,
          lead.location,
          lead.importedLocally, // Новая колонка I
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Лист1!A:I', // Обновлено до колонки I
        valueInputOption: 'RAW',
        resource: { values },
      });

      logger.info(`✓ Lead added to Google Sheets: ${lead.leadName}`);
      return true;
    } catch (error) {
      logger.error('Failed to add lead to Google Sheets:', error);
      return false;
    }
  }

  /**
   * Прочитать лиды из leads.xlsx
   */
  async readLeadsFromExcel(filePath: string): Promise<ExcelLead[]> {
    try {
      if (!fs.existsSync(filePath)) {
        logger.warn(`Excel file not found: ${filePath}`);
        return [];
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        logger.warn('No worksheet found in Excel file');
        return [];
      }

      const leads: ExcelLead[] = [];

      // Начинаем со 2-й строки (пропускаем заголовки)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Пропускаем заголовок

        const name = row.getCell(1).value?.toString() || '';
        const phone = row.getCell(2).value?.toString() || '';
        const category = row.getCell(3).value?.toString() || '';
        const channel = row.getCell(4).value?.toString() || '';
        const messageLink = row.getCell(5).value?.toString() || '';
        const originalMessage = row.getCell(6).value?.toString() || '';
        const date = row.getCell(7).value?.toString() || '';

        if (name && phone && category) {
          leads.push({
            name,
            phone,
            category,
            channel,
            messageLink,
            originalMessage,
            date,
          });
        }
      });

      logger.info(`📊 Read ${leads.length} leads from Excel`);
      return leads;
    } catch (error) {
      logger.error('Failed to read leads from Excel:', error);
      return [];
    }
  }

  /**
   * Конвертировать лид из Excel в формат Google Sheets
   */
  private convertExcelToGoogleSheets(excelLead: ExcelLead): GoogleSheetsLead {
    // Маппинг категорий
    const categoryMap: Record<string, string> = {
      'Биохимия': 'Bioximiya',
      'Снеки': 'Snacks',
      'Вода': 'drinks',
      'Кешью': 'snacks',
    };

    return {
      leadName: excelLead.name,
      contactName: excelLead.name, // Используем имя компании как контакт
      position: '', // Пустое поле
      transaction: '', // Пустое поле
      phoneNumber: excelLead.phone,
      industryCategory: 'FMCG', // Всегда FMCG
      industryName: categoryMap[excelLead.category] || excelLead.category,
      location: this.extractLocation(excelLead.channel), // Извлекаем из канала
      importedLocally: 'YES', // Помечаем что лид импортирован из локального Excel
    };
  }

  /**
   * Извлечь локацию из названия канала
   */
  private extractLocation(channel: string): string {
    // Все каналы узбекские, поэтому по умолчанию Узбекистан
    return 'Toshkent'; // Можно расширить логику при необходимости
  }

  /**
   * Синхронизировать лиды из Excel в Google Sheets
   */
  async syncFromExcel(excelPath: string): Promise<{
    total: number;
    added: number;
    duplicates: number;
    failed: number;
  }> {
    const stats = {
      total: 0,
      added: 0,
      duplicates: 0,
      failed: 0,
    };

    try {
      logger.info('🔄 Starting sync from Excel to Google Sheets...');

      // 1. Получаем существующие номера телефонов из Google Sheets
      // Проверяем дубликаты ТОЛЬКО по номеру телефона
      const existingPhones = await this.getExistingPhones();

      // 2. Читаем лиды из Excel
      const excelLeads = await this.readLeadsFromExcel(excelPath);
      stats.total = excelLeads.length;

      if (excelLeads.length === 0) {
        logger.warn('No leads found in Excel file');
        return stats;
      }

      // 3. Обрабатываем каждый лид
      for (const excelLead of excelLeads) {
        const googleLead = this.convertExcelToGoogleSheets(excelLead);

        // Проверяем на дубликат по номеру телефона
        if (this.isDuplicateByPhone(googleLead, existingPhones)) {
          stats.duplicates++;
          logger.info(`⚠ Duplicate phone found: ${googleLead.leadName} (${googleLead.phoneNumber}) - SKIPPED`);
          continue;
        }

        // Добавляем лид
        const success = await this.addLead(googleLead);
        if (success) {
          stats.added++;
          // Добавляем телефон в локальный кэш чтобы избежать повторных добавлений в этой же сессии
          const normalizedPhone = this.normalizePhone(googleLead.phoneNumber);
          existingPhones.add(normalizedPhone);
        } else {
          stats.failed++;
        }

        // Небольшая задержка чтобы не перегружать API
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      logger.info('✓ Sync completed!');
      logger.info(`📊 Stats: Total=${stats.total}, Added=${stats.added}, Duplicates=${stats.duplicates}, Failed=${stats.failed}`);

      return stats;
    } catch (error) {
      logger.error('Failed to sync from Excel:', error);
      return stats;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
