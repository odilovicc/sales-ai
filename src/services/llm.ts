/**
 * LLM Service for lead qualification
 * Analyzes messages and extracts lead information
 */

import { Ollama } from 'ollama';
import type { LLMResponse } from '../types';
import { config } from '../config';
import * as logger from '../utils/logger';

// Initialize Ollama client
const ollama = new Ollama({ host: 'http://localhost:11434' });

/**
 * System prompt for LLM lead filtering
 */
const SYSTEM_PROMPT = `Ты - эксперт по квалификации B2B лидов в пищевой промышленности. Будь внимательным и точным.

КАТЕГОРИИ (ТОЛЬКО ЭТИ 4):
1. **Биохимия** - биохимические добавки, ферменты, витамины для пищевой промышленности
2. **Снеки** - чипсы, кукурузные палочки, попкорн, сухарики, крекеры, кукурузные снеки
3. **Вода** - питьевая вода, минеральная вода в бутылках
4. **Кешью** - орехи (кешью, арахис, миндаль), сухофрукты, ореховая продукция

ПРАВИЛА ОПРЕДЕЛЕНИЯ КАТЕГОРИИ:
- Кукуруза, кукурузные изделия, попкорн → **Снеки**
- Чипсы, крекеры, сухарики → **Снеки**
- Вода в бутылках → **Вода**
- Орехи, сухофрукты → **Кешью**
- Биодобавки, ферменты → **Биохимия**

ПРАВИЛА ОПРЕДЕЛЕНИЯ НАЗВАНИЯ КОМПАНИИ:
1. Ищи название БРЕНДА или КОМПАНИИ в кавычках или заглавными буквами
2. НЕ используй названия стран (Узбекистан, Тожикистон, Казахстан)
3. НЕ используй названия городов (Ташкент, Самарканд)
4. НЕ используй имена людей как название компании
5. Если нет явного названия компании, используй название бренда продукта

ПРИМЕРЫ ПРАВИЛЬНОГО ОПРЕДЕЛЕНИЯ:

Пример 1:
Текст: "OKEY - кукурузные снеки. Контакт: +998901194777"
Ответ: {"is_lead": true, "name": "OKEY", "phone": "+998901194777", "category": "Снеки"}

Пример 2:
Текст: "Завод Кристалл производит питьевую воду. Тел: +998123456789"
Ответ: {"is_lead": true, "name": "Завод Кристалл", "phone": "+998123456789", "category": "Вода"}

Пример 3:
Текст: "Компания NutsPro продает кешью оптом. +998999999999"
Ответ: {"is_lead": true, "name": "NutsPro", "phone": "+998999999999", "category": "Кешью"}

СТРОГИЕ ТРЕБОВАНИЯ:
✅ ОБЯЗАТЕЛЬНО: деловое предложение от компании
✅ ОБЯЗАТЕЛЬНО: телефон контакта
✅ ОБЯЗАТЕЛЬНО: четкая категория из списка
❌ НЕ БЕРЕМ: личные вопросы, обсуждения, запросы на покупку
❌ НЕ БЕРЕМ: услуги (логистика, реклама, оборудование)

ФОРМАТ ОТВЕТА (ТОЛЬКО JSON):
{
  "is_lead": true/false,
  "name": "Название компании/бренда",
  "phone": "Номер телефона",
  "category": "Биохимия/Снеки/Вода/Кешью"
}

Если НЕ лид:
{
  "is_lead": false,
  "name": "",
  "phone": "",
  "category": ""
}`;

/**
 * Call Ollama local LLM to analyze message
 * Uses Llama 3.2 model running locally
 */
export async function callLLM(prompt: string): Promise<string> {
    try {
        logger.debug('Calling Ollama with Llama 3.2...');

        // Call Ollama with llama3.2 model
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt },
            ],
            options: {
                temperature: 0.3,
                num_predict: 500, // max tokens
            },
        });

        const content = response.message.content || '';
        logger.debug('Ollama response received');

        return content;
    } catch (error) {
        logger.error('Ollama API call failed:', error);
        throw error;
    }
}

/**
 * Parse message through LLM and extract lead information
 */
export async function parseMessageThroughLLM(messageText: string): Promise<LLMResponse | null> {
    try {
        logger.debug('Analyzing message through LLM...');

        // Call LLM with the message
        const llmResponse = await callLLM(messageText);

        // Parse JSON response
        const parsed = parseJSONResponse(llmResponse);

        if (!parsed) {
            logger.warn('Failed to parse LLM response as JSON');
            return null;
        }

        // Validate response format
        if (!isValidLLMResponse(parsed)) {
            logger.warn('Invalid LLM response format');
            return null;
        }

        // Additional validation for leads
        if (parsed.is_lead) {
            // STRICT: Only accept 4 specific categories
            const validCategories = ['Биохимия', 'Снеки', 'Вода', 'Кешью'];
            const categoryNormalized = parsed.category.trim();
            
            if (!validCategories.includes(categoryNormalized)) {
                logger.warn(`Lead rejected: invalid category "${categoryNormalized}" (must be one of: ${validCategories.join(', ')})`);
                parsed.is_lead = false;
                return parsed;
            }

            // Clean and validate company name
            let cleanName = parsed.name.trim();
            
            // Filter out country/city names that shouldn't be company names
            const invalidNames = [
                'тожикистон', 'узбекистон', 'казахстан', 'туркманистон', 'киргизия', 'киргизистон',
                'ташкент', 'самарканд', 'бухара', 'андижон', 'фергана', 'наманган',
                'тошкент', 'қозоғистон', 'қирғизистон'
            ];
            
            if (invalidNames.includes(cleanName.toLowerCase())) {
                logger.warn(`Lead rejected: company name "${cleanName}" is a country/city name, not a company`);
                parsed.is_lead = false;
                return parsed;
            }

            if (!cleanName || cleanName.length < 2) {
                logger.warn('Lead rejected: invalid company name');
                parsed.is_lead = false;
                return parsed;
            }

            parsed.name = cleanName;

            // Validate phone number
            if (!parsed.phone || parsed.phone.trim().length < 5) {
                logger.warn('Lead rejected: no phone number');
                parsed.is_lead = false;
                return parsed;
            }

            logger.success(`✓ Lead detected: ${parsed.name} (${parsed.category})`);
        } else {
            logger.debug('Not a lead');
        }

        return parsed;
    } catch (error) {
        logger.error('Error parsing message through LLM:', error);
        return null;
    }
}

/**
 * Parse JSON from LLM response
 * Handles cases where LLM might include markdown code blocks
 */
function parseJSONResponse(response: string): any {
    try {
        // Try direct parse first
        return JSON.parse(response);
    } catch {
        // Try to extract JSON from markdown code block
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch {
                // Fall through
            }
        }

        // Try to find JSON object in the response
        const objectMatch = response.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            try {
                return JSON.parse(objectMatch[0]);
            } catch {
                // Fall through
            }
        }

        return null;
    }
}

/**
 * Validate LLM response structure
 */
function isValidLLMResponse(obj: any): obj is LLMResponse {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.is_lead === 'boolean' &&
        typeof obj.name === 'string' &&
        typeof obj.phone === 'string' &&
        typeof obj.category === 'string'
    );
}

/**
 * Mock LLM function for testing without API
 * Remove this in production
 */
export async function mockLLM(messageText: string): Promise<LLMResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple keyword-based mock logic
    const lowerText = messageText.toLowerCase();
    const isLead =
        lowerText.includes('снек') ||
        lowerText.includes('орех') ||
        lowerText.includes('кешью') ||
        lowerText.includes('вода') ||
        lowerText.includes('биохим');

    if (isLead) {
        return {
            is_lead: true,
            name: 'Тестовая компания',
            phone: '+7 (999) 123-45-67',
            category: 'Производство снеков',
        };
    }

    return {
        is_lead: false,
        name: '',
        phone: '',
        category: '',
    };
}
