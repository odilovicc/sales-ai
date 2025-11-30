/**
 * Configuration module for Telegram Userbot
 * Loads and validates environment variables
 */

import type { AppConfig } from '../types';
import * as logger from '../utils/logger';

/**
 * Load environment variable with validation
 */
function getEnvVar(key: string, required: boolean = true): string {
    const value = process.env[key];

    if (required && !value) {
        logger.error(`Missing required environment variable: ${key}`);
        logger.info('Please check your .env file and ensure all required variables are set.');
        process.exit(1);
    }

    return value || '';
}

/**
 * Parse channels from environment variable
 */
function parseChannels(channelsStr: string): string[] {
    if (!channelsStr) {
        return [];
    }

    return channelsStr
        .split(',')
        .map(ch => ch.trim())
        .filter(ch => ch.length > 0);
}

/**
 * Application configuration
 */
export const config: AppConfig = {
    telegram: {
        apiId: parseInt(getEnvVar('API_ID'), 10),
        apiHash: getEnvVar('API_HASH'),
        phoneNumber: getEnvVar('PHONE_NUMBER'),
        sessionName: 'userbot_session',
        sessionString: getEnvVar('SESSION_STRING', false),
    },
    llm: {
        apiKey: getEnvVar('LLM_API_KEY', false),
        apiUrl: getEnvVar('LLM_API_URL', false),
    },
    channels: parseChannels(getEnvVar('CHANNELS', false)),
    bot: {
        analyzeHistory: getEnvVar('ANALYZE_HISTORY', false).toLowerCase() === 'true',
        historyLimit: parseInt(getEnvVar('HISTORY_LIMIT', false) || '50', 10),
        minMessageLength: parseInt(getEnvVar('MIN_MESSAGE_LENGTH', false) || '20', 10),
        historyDelay: parseInt(getEnvVar('HISTORY_DELAY', false) || '1000', 10),
        channelDelay: parseInt(getEnvVar('CHANNEL_DELAY', false) || '2000', 10),
    },
};

/**
 * Validate configuration
 */
export function validateConfig(): boolean {
    const { telegram, llm } = config;

    // Validate Telegram config
    if (isNaN(telegram.apiId) || telegram.apiId <= 0) {
        logger.error('Invalid API_ID: must be a positive number');
        return false;
    }

    if (!telegram.apiHash || telegram.apiHash.length < 10) {
        logger.error('Invalid API_HASH: must be a valid hash from my.telegram.org');
        return false;
    }

    if (!telegram.phoneNumber || !telegram.phoneNumber.startsWith('+')) {
        logger.error('Invalid PHONE_NUMBER: must start with + and include country code');
        return false;
    }

    // LLM config is optional for Ollama (local model)
    logger.info('Using Ollama local LLM (llama3.2) at http://localhost:11434');

    logger.success('Configuration validated successfully');
    return true;
}

/**
 * Default channels to join
 * You can add your channels here or use the CHANNELS environment variable
 */
export const DEFAULT_CHANNELS: string[] = [
    // Add your channels here, e.g.:
    // '@example_channel',
    // 'https://t.me/another_channel',
];

export default config;
