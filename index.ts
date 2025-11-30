/**
 * Telegram Userbot - Main Entry Point
 * Production-ready userbot using GramJS for lead generation
 * 
 * @author Your Name
 * @version 1.0.0
 */

import { config, validateConfig, DEFAULT_CHANNELS } from './src/config';
import * as logger from './src/utils/logger';
import { validateOllama } from './src/utils/ollama-check';
import {
    initializeClient,
    authenticate,
    joinChannels,
    processRecentMessages,
    listenForMessages,
    disconnect,
} from './src/services/telegram';
import { loadExistingLeadsToCache } from './src/services/excel';

/**
 * Main application function
 */
async function main(): Promise<void> {
    try {
        // Print banner
        printBanner();

        // Validate configuration
        logger.info('Validating configuration...');
        if (!validateConfig()) {
            logger.error('Configuration validation failed. Please check your .env file.');
            process.exit(1);
        }

        // Validate Ollama
        if (!await validateOllama()) {
            logger.error('Ollama validation failed. Please check OLLAMA_SETUP.md for setup instructions.');
            process.exit(1);
        }

        // Load existing leads to prevent duplicates
        logger.info('Loading existing leads...');
        await loadExistingLeadsToCache();

        // Initialize Telegram client
        const client = await initializeClient();

        // Authenticate
        await authenticate();

        // Get channels to join
        const channelsToJoin = config.channels.length > 0
            ? config.channels
            : DEFAULT_CHANNELS;

        // Join channels if any are specified
        if (channelsToJoin.length > 0) {
            await joinChannels(channelsToJoin);
            
            // Process recent messages if enabled in config
            if (config.bot.analyzeHistory) {
                logger.info(`\n🔄 Analyzing last ${config.bot.historyLimit} messages from each channel...`);
                await processRecentMessages(channelsToJoin, config.bot.historyLimit);
            } else {
                logger.info('\n⏭ History analysis disabled (ANALYZE_HISTORY=false)');
                logger.info('Bot will only process NEW messages from now on');
            }
        } else {
            logger.warn('No channels specified. Add channels to .env or src/config/index.ts');
            logger.info('The bot will still listen to messages in chats you are already in.');
        }

        // Start listening for messages (only from specified channels)
        await listenForMessages(channelsToJoin);

        // Keep the process running
        logger.info('\n✓ Userbot is now running!');
        logger.info('Monitoring all channels and groups for new messages...');
        logger.info('Leads will be automatically saved to leads.xlsx\n');

        // Handle graceful shutdown
        setupGracefulShutdown();

    } catch (error) {
        logger.error('Fatal error:', error);
        await disconnect();
        process.exit(1);
    }
}

/**
 * Print application banner
 */
function printBanner(): void {
    console.log('\n' + '='.repeat(60));
    console.log('  🤖 Telegram Userbot - Lead Generation System');
    console.log('  Powered by GramJS');
    console.log('='.repeat(60) + '\n');
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
        logger.info(`\n\nReceived ${signal}, shutting down gracefully...`);
        await disconnect();
        logger.success('Goodbye! 👋');
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Handle uncaught errors
    process.on('uncaughtException', async (error) => {
        logger.error('Uncaught exception:', error);
        await disconnect();
        process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
        logger.error('Unhandled rejection at:', promise, 'reason:', reason);
        await disconnect();
        process.exit(1);
    });
}

// Run the application
main().catch(async (error) => {
    logger.error('Application failed to start:', error);
    await disconnect();
    process.exit(1);
});
