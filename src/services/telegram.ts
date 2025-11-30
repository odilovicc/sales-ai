/**
 * Telegram Service using GramJS
 * Handles client initialization, authentication, and message listening
 */

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import input from 'input';
import { config } from '../config';
import * as logger from '../utils/logger';
import { parseMessageThroughLLM } from './llm';
import { saveLeadToExcel, createLead } from './excel';

let client: TelegramClient | null = null;
let monitoredChannels: string[] = [];

/**
 * Initialize Telegram client
 */
export async function initializeClient(): Promise<TelegramClient> {
    try {
        logger.info('Initializing Telegram client...');

        const { apiId, apiHash, sessionString } = config.telegram;

        // Use saved session string if available
        const session = new StringSession(sessionString || '');
        
        if (sessionString) {
            logger.success('✓ Using saved session (no authentication needed)');
        } else {
            logger.info('No saved session - will need to authenticate');
        }

        client = new TelegramClient(session, apiId, apiHash, {
            connectionRetries: 5,
            useWSS: false,
        });

        logger.success('Telegram client initialized');
        return client;
    } catch (error) {
        logger.error('Failed to initialize Telegram client:', error);
        throw error;
    }
}

/**
 * Authenticate user with phone number
 */
export async function authenticate(): Promise<void> {
    if (!client) {
        throw new Error('Client not initialized');
    }

    try {
        logger.info('Starting authentication...');

        await client.start({
            phoneNumber: async () => config.telegram.phoneNumber,
            password: async () => {
                const pwd = await input.text('Please enter your 2FA password (press Enter to skip if not enabled): ');
                return pwd.trim() || ''; // Return empty string if Enter pressed
            },
            phoneCode: async () => {
                return await input.text('Please enter the code you received: ');
            },
            onError: (err) => {
                logger.error('Authentication error:', err);
            },
        });

        logger.success('✓ Successfully authenticated!');

        // Save session for future use
        const sessionString = client.session.save() as unknown as string;
        logger.info('Session string (save this for future use):');
        logger.info(sessionString);
    } catch (error) {
        logger.error('Authentication failed:', error);
        throw error;
    }
}

/**
 * Join a list of channels/groups
 */
export async function joinChannels(channels: string[]): Promise<void> {
    if (!client) {
        throw new Error('Client not initialized');
    }

    if (channels.length === 0) {
        logger.warn('No channels to join');
        return;
    }

    logger.info(`Joining ${channels.length} channel(s)...`);

    for (const channel of channels) {
        try {
            logger.info(`Joining: ${channel}`);

            // Join channel/group
            await client.invoke(
                new (await import('telegram/tl')).Api.channels.JoinChannel({
                    channel: channel,
                })
            );

            logger.success(`✓ Joined: ${channel}`);

            // Rate limiting: wait between joins to avoid Telegram restrictions
            await sleep(2000); // 2 seconds between joins
        } catch (error: any) {
            // Handle common errors
            if (error.message?.includes('FLOOD_WAIT')) {
                const waitTime = parseInt(error.message.match(/\d+/)?.[0] || '60');
                logger.warn(`Rate limited. Waiting ${waitTime} seconds...`);
                await sleep(waitTime * 1000);

                // Retry
                try {
                    await client.invoke(
                        new (await import('telegram/tl')).Api.channels.JoinChannel({
                            channel: channel,
                        })
                    );
                    logger.success(`✓ Joined: ${channel}`);
                } catch (retryError) {
                    logger.error(`Failed to join ${channel}:`, retryError);
                }
            } else if (error.message?.includes('USER_ALREADY_PARTICIPANT')) {
                logger.info(`Already a member of: ${channel}`);
            } else {
                logger.error(`Failed to join ${channel}:`, error);
            }
        }
    }

    logger.success('Finished joining channels');
}

/**
 * Process recent messages from specified channels
 */
export async function processRecentMessages(channels: string[], limit: number = 50): Promise<void> {
    if (!client) {
        throw new Error('Client not initialized');
    }

    if (channels.length === 0) {
        logger.warn('No channels to process');
        return;
    }

    logger.info(`\n📜 Processing recent messages from ${channels.length} channel(s)...`);
    logger.info(`Will check up to ${limit} recent messages per channel\n`);

    for (const channelName of channels) {
        try {
            logger.info(`Fetching messages from ${channelName}...`);

            // Get the channel entity
            const channel = await client.getEntity(channelName);

            // Get recent messages
            const messages = await client.getMessages(channel, {
                limit: limit,
            });

            logger.info(`Found ${messages.length} messages in ${channelName}`);

            let processedCount = 0;

            // Process messages in reverse order (oldest first)
            for (const message of messages.reverse()) {
                let messageText = message.text || message.message || '';
                
                // If message has photo/media, get caption
                if (message.media && message.message) {
                    messageText = message.message;
                }

                if (!messageText || messageText.trim().length === 0) {
                    continue;
                }

                // Apply same filters as in handleNewMessage
                if (messageText.length < config.bot.minMessageLength) continue;
                if (messageText.startsWith('/') || messageText.startsWith('!')) continue;
                if (messageText.match(/^https?:\/\//)) continue;

                processedCount++;

                // Build message link
                const messageId = message.id;
                const channelUsername = (channel as any)?.username;
                let messageLink = 'N/A';
                if (channelUsername) {
                    messageLink = `https://t.me/${channelUsername}/${messageId}`;
                }

                logger.info(`\n${'─'.repeat(60)}`);
                logger.info(`📜 [HISTORY] Message ${processedCount} from ${channelName}`);
                logger.debug(`Preview: ${messageText.substring(0, 150)}...`);

                // Process through LLM
                const llmResponse = await parseMessageThroughLLM(messageText);

                if (!llmResponse) {
                    logger.warn('Failed to get LLM response');
                    continue;
                }

                if (llmResponse.is_lead) {
                    logger.success('🎯 LEAD DETECTED in history!');
                    logger.info(`Name: ${llmResponse.name}`);
                    logger.info(`Phone: ${llmResponse.phone}`);
                    logger.info(`Category: ${llmResponse.category}`);

                    const lead = createLead(
                        llmResponse.name,
                        llmResponse.phone,
                        llmResponse.category,
                        messageText,
                        channelName,
                        messageLink
                    );

                    await saveLeadToExcel(lead);
                    logger.success('✓ Lead saved!');
                } else {
                    logger.debug('Not a qualified lead');
                }

                // Small delay to avoid overloading (from config)
                await sleep(config.bot.historyDelay);
            }

            logger.success(`✓ Processed ${processedCount} messages from ${channelName}\n`);

            // Delay between channels (from config)
            await sleep(config.bot.channelDelay);

        } catch (error: any) {
            logger.error(`Error processing ${channelName}:`, error.message);
        }
    }

    logger.success('✓ Finished processing recent messages from all channels\n');
}

/**
 * Listen for new messages in specified channels only
 */
export async function listenForMessages(channels?: string[]): Promise<void> {
    if (!client) {
        throw new Error('Client not initialized');
    }

    // Store channels to monitor
    if (channels && channels.length > 0) {
        monitoredChannels = channels;
    }

    logger.info('Starting message listener...');
    
    if (monitoredChannels.length > 0) {
        logger.info(`Listening ONLY to these channels: ${monitoredChannels.join(', ')}`);
        
        // Add event handler with channel filter
        // GramJS will resolve channel names automatically
        client.addEventHandler(handleNewMessage, new NewMessage({
            chats: monitoredChannels, // Pass channel names directly
        }));
    } else {
        logger.warn('No channels specified - will monitor ALL chats');
        client.addEventHandler(handleNewMessage, new NewMessage({}));
    }

    logger.success('✓ Message listener active');
    logger.info('✓ Will process only NEW messages from now on');
    logger.info('Press Ctrl+C to stop');
}

/**
 * Handle new message event
 */
async function handleNewMessage(event: NewMessageEvent): Promise<void> {
    try {
        const message = event.message;

        // Get chat information
        const chat = await event.getChat();
        const chatId = (chat as any)?.id;
        const chatTitle = (chat as any)?.title || (chat as any)?.firstName || 'Unknown';
        const chatUsername = (chat as any)?.username;

        // Get message text (including caption for photos)
        let messageText = message.text || message.message || '';
        
        // If message has photo/media, get caption
        if (message.media && message.message) {
            messageText = message.message; // Caption text
            logger.debug('Message contains media with caption');
        }

        if (!messageText || messageText.trim().length === 0) {
            return; // Skip empty messages
        }

        // Skip short messages (use config)
        if (messageText.length < config.bot.minMessageLength) {
            return; // Skip very short messages
        }

        // Skip messages that look like commands or system messages
        if (messageText.startsWith('/') || messageText.startsWith('!')) {
            return; // Skip bot commands
        }

        // Skip messages that are just links
        if (messageText.match(/^https?:\/\//)) {
            return; // Skip bare links
        }

        // Build message link
        const messageId = message.id;
        let messageLink = 'N/A';
        if (chatUsername) {
            messageLink = `https://t.me/${chatUsername}/${messageId}`;
        } else if (chatId) {
            messageLink = `https://t.me/c/${String(chatId).replace('-100', '')}/${messageId}`;
        }

        logger.info(`\n${'='.repeat(60)}`);
        logger.info(`📨 New message from: ${chatTitle} ${chatUsername ? `(@${chatUsername})` : ''}`);
        logger.info(`Message ID: ${messageId}, Link: ${messageLink}`);
        logger.info(`Message length: ${messageText.length} characters`);
        logger.debug(`Message preview: ${messageText.substring(0, 150)}...`);

        // Process message through LLM
        const llmResponse = await parseMessageThroughLLM(messageText);

        if (!llmResponse) {
            logger.warn('Failed to get LLM response');
            return;
        }

        // Check if it's a lead
        if (llmResponse.is_lead) {
            logger.success('🎯 LEAD DETECTED!');
            logger.info(`Name: ${llmResponse.name}`);
            logger.info(`Phone: ${llmResponse.phone}`);
            logger.info(`Category: ${llmResponse.category}`);
            logger.info(`Channel: ${chatTitle}`);
            logger.info(`Link: ${messageLink}`);

            // Create lead object
            const lead = createLead(
                llmResponse.name,
                llmResponse.phone,
                llmResponse.category,
                messageText,
                chatTitle,
                messageLink
            );

            // Save to Excel
            await saveLeadToExcel(lead);

            logger.success('✓ Lead saved successfully!');
        } else {
            logger.debug('Not a qualified lead');
        }

        logger.info(`${'='.repeat(60)}\n`);
    } catch (error) {
        logger.error('Error handling message:', error);
    }
}

/**
 * Get client instance
 */
export function getClient(): TelegramClient | null {
    return client;
}

/**
 * Disconnect client
 */
export async function disconnect(): Promise<void> {
    if (client) {
        logger.info('Disconnecting Telegram client...');
        await client.disconnect();
        logger.success('Disconnected');
    }
}

/**
 * Utility: Sleep function
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
