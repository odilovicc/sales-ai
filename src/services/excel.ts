/**
 * Excel Service for lead data export
 * Manages leads.xlsx file with ExcelJS
 */

import ExcelJS from 'exceljs';
import type { Lead } from '../types';
import * as logger from '../utils/logger';
import { existsSync } from 'fs';

const EXCEL_FILE_PATH = './leads.xlsx';

/**
 * Column headers for the Excel file
 */
const HEADERS = [
    { header: 'Имя компании', key: 'name', width: 30 },
    { header: 'Телефон', key: 'phone', width: 20 },
    { header: 'Категория', key: 'category', width: 20 },
    { header: 'Канал/Группа', key: 'channel', width: 25 },
    { header: 'Ссылка на сообщение', key: 'messageLink', width: 50 },
    { header: 'Оригинальное сообщение', key: 'originalMessage', width: 60 },
    { header: 'Дата добавления', key: 'dateAdded', width: 25 },
];

/**
 * Cache of existing leads to prevent duplicates
 * Key format: "phone_number|company_name"
 */
const existingLeadsCache = new Set<string>();

/**
 * Initialize Excel file if it doesn't exist
 */
async function initializeExcelFile(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();

    if (existsSync(EXCEL_FILE_PATH)) {
        // Load existing file
        try {
            await workbook.xlsx.readFile(EXCEL_FILE_PATH);
            logger.debug('Loaded existing Excel file');
        } catch (error) {
            logger.warn('Failed to load existing Excel file, creating new one');
            createNewWorksheet(workbook);
        }
    } else {
        // Create new file
        logger.info('Creating new Excel file');
        createNewWorksheet(workbook);
    }

    return workbook;
}

/**
 * Create new worksheet with headers
 */
function createNewWorksheet(workbook: ExcelJS.Workbook): void {
    const worksheet = workbook.addWorksheet('Leads', {
        views: [{ state: 'frozen', ySplit: 1 }], // Freeze header row
    });

    // Set columns
    worksheet.columns = HEADERS;

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;
}

/**
 * Save lead to Excel file
 */
export async function saveLeadToExcel(lead: Lead): Promise<void> {
    try {
        // Check for duplicates
        if (isDuplicate(lead.phone, lead.name)) {
            logger.warn(`⚠ Duplicate lead detected: ${lead.name} (${lead.phone}) - SKIPPED`);
            return;
        }

        logger.info(`Saving lead to Excel: ${lead.name}`);
        logger.debug(`Lead data: Name="${lead.name}", Phone="${lead.phone}", Category="${lead.category}", Channel="${lead.channel}"`);

        // Initialize or load workbook
        const workbook = await initializeExcelFile();

        // Get or create worksheet
        let worksheet = workbook.getWorksheet('Leads');
        if (!worksheet) {
            createNewWorksheet(workbook);
            worksheet = workbook.getWorksheet('Leads')!;
        }

        // Add new row with values array (in correct column order)
        const newRow = worksheet.addRow([
            lead.name,
            lead.phone,
            lead.category,
            lead.channel,
            lead.messageLink,
            lead.originalMessage,
            lead.dateAdded,
        ]);

        // Make message link clickable (column 5)
        if (lead.messageLink && lead.messageLink !== 'N/A') {
            const linkCell = newRow.getCell(5);
            linkCell.value = {
                text: 'Открыть сообщение',
                hyperlink: lead.messageLink,
            };
            linkCell.font = { color: { argb: 'FF0563C1' }, underline: true };
        }

        // Style the new row
        newRow.alignment = { vertical: 'top', wrapText: true };
        newRow.height = 40;
        
        // Apply borders to all cells
        newRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        // Alternate row colors for better readability
        if (newRow.number % 2 === 0) {
            newRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF2F2F2' },
            };
        }

        // Save file
        await workbook.xlsx.writeFile(EXCEL_FILE_PATH);

        // Add to cache
        addToCache(lead.phone, lead.name);

        logger.success(`✓ Lead saved to ${EXCEL_FILE_PATH} (row ${newRow.number})`);
    } catch (error) {
        logger.error('Failed to save lead to Excel:', error);
        throw error;
    }
}

/**
 * Get total number of leads in Excel file
 */
export async function getLeadCount(): Promise<number> {
    try {
        if (!existsSync(EXCEL_FILE_PATH)) {
            return 0;
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(EXCEL_FILE_PATH);

        const worksheet = workbook.getWorksheet('Leads');
        if (!worksheet) {
            return 0;
        }

        // Subtract 1 for header row
        return worksheet.rowCount - 1;
    } catch (error) {
        logger.error('Failed to get lead count:', error);
        return 0;
    }
}

/**
 * Create a Lead object from LLM response and message
 */
export function createLead(
    name: string,
    phone: string,
    category: string,
    originalMessage: string,
    channel: string,
    messageLink: string
): Lead {
    // Validate and clean data
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanCategory = category.trim();
    const cleanChannel = channel.trim();

    // Ensure we have valid data
    if (!cleanName || !cleanPhone || !cleanCategory) {
        throw new Error('Cannot create lead with empty fields');
    }

    return {
        name: cleanName,
        phone: cleanPhone,
        category: cleanCategory,
        channel: cleanChannel,
        messageLink: messageLink || 'N/A',
        originalMessage: originalMessage.substring(0, 500).trim(), // Limit message length
        dateAdded: new Date().toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }),
    };
}

/**
 * Check if lead is a duplicate
 */
export function isDuplicate(phone: string, name: string): boolean {
    const key = `${phone.trim()}|${name.trim()}`.toLowerCase();
    return existingLeadsCache.has(key);
}

/**
 * Add lead to cache
 */
function addToCache(phone: string, name: string): void {
    const key = `${phone.trim()}|${name.trim()}`.toLowerCase();
    existingLeadsCache.add(key);
}

/**
 * Load existing leads into cache to prevent duplicates
 */
export async function loadExistingLeadsToCache(): Promise<void> {
    try {
        if (!existsSync(EXCEL_FILE_PATH)) {
            logger.info('No existing leads file - starting fresh');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(EXCEL_FILE_PATH);

        const worksheet = workbook.getWorksheet('Leads');
        if (!worksheet) {
            return;
        }

        let count = 0;
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const phone = row.getCell(2).value?.toString() || '';
            const name = row.getCell(1).value?.toString() || '';

            if (phone && name) {
                addToCache(phone, name);
                count++;
            }
        });

        logger.success(`✓ Loaded ${count} existing leads into cache`);
    } catch (error) {
        logger.error('Failed to load existing leads:', error);
    }
}
