/**
 * TypeScript type definitions for the Telegram Userbot
 */

/**
 * Telegram configuration interface
 */
export interface TelegramConfig {
    apiId: number;
    apiHash: string;
    phoneNumber: string;
    sessionName?: string;
    sessionString?: string;
}

/**
 * LLM response format for lead qualification
 */
export interface LLMResponse {
    is_lead: boolean;
    name: string;
    phone: string;
    category: string;
}

/**
 * Lead data structure for Excel export
 */
export interface Lead {
    name: string;
    phone: string;
    category: string;
    originalMessage: string;
    channel: string;
    messageLink: string;
    dateAdded: string;
}

/**
 * Bot settings for message processing
 */
export interface BotSettings {
    analyzeHistory: boolean;
    historyLimit: number;
    minMessageLength: number;
    historyDelay: number;
    channelDelay: number;
}

/**
 * Application configuration
 */
export interface AppConfig {
    telegram: TelegramConfig;
    llm: {
        apiKey: string;
        apiUrl: string;
    };
    channels: string[];
    bot: BotSettings;
}
