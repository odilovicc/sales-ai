/**
 * Logger utility for colored console output
 */

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
};

/**
 * Get formatted timestamp
 */
function getTimestamp(): string {
    const now = new Date();
    return now.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

/**
 * Log info message
 */
export function info(message: string, ...args: any[]): void {
    console.log(
        `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.blue}ℹ${colors.reset} ${message}`,
        ...args
    );
}

/**
 * Log success message
 */
export function success(message: string, ...args: any[]): void {
    console.log(
        `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.green}✓${colors.reset} ${message}`,
        ...args
    );
}

/**
 * Log warning message
 */
export function warn(message: string, ...args: any[]): void {
    console.log(
        `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.yellow}⚠${colors.reset} ${message}`,
        ...args
    );
}

/**
 * Log error message
 */
export function error(message: string, ...args: any[]): void {
    console.error(
        `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.red}✗${colors.reset} ${message}`,
        ...args
    );
}

/**
 * Log debug message
 */
export function debug(message: string, ...args: any[]): void {
    console.log(
        `${colors.gray}[${getTimestamp()}] 🔍 ${message}${colors.reset}`,
        ...args
    );
}

export default {
    info,
    success,
    warn,
    error,
    debug,
};
