/**
 * Ollama Health Check Utility
 * Verifies that Ollama is running and Llama 3.2 is available
 */

import * as logger from './logger';

/**
 * Check if Ollama server is running
 */
export async function checkOllamaServer(): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:11434');
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Check if Llama 3.2 model is available
 */
export async function checkLlamaModel(): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) return false;

        const data = await response.json() as { models?: Array<{ name: string }> };
        const models = data.models || [];
        
        return models.some((model) => 
            model.name && model.name.includes('llama3.2')
        );
    } catch {
        return false;
    }
}

/**
 * Perform comprehensive Ollama health check
 */
export async function validateOllama(): Promise<boolean> {
    logger.info('🔍 Checking Ollama configuration...');

    // Check if server is running
    const serverRunning = await checkOllamaServer();
    if (!serverRunning) {
        logger.error('❌ Ollama server is not running!');
        logger.error('   Please start it with: ollama serve');
        logger.error('   See OLLAMA_SETUP.md for details');
        return false;
    }
    logger.success('✓ Ollama server is running');

    // Check if model is available
    const modelAvailable = await checkLlamaModel();
    if (!modelAvailable) {
        logger.error('❌ Llama 3.2 model is not installed!');
        logger.error('   Please install it with: ollama pull llama3.2');
        logger.error('   See OLLAMA_SETUP.md for details');
        return false;
    }
    logger.success('✓ Llama 3.2 model is available');

    logger.success('✓ Ollama is ready!');
    return true;
}
