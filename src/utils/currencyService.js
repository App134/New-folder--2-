// Currency Service - Exchange Rate Management
// Uses Frankfurter API for live rates with localStorage caching

const CACHE_KEY = 'exchange_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const API_BASE_URL = 'https://api.frankfurter.app';

// Fallback rates (1 INR = X) - Updated Feb 2026
const FALLBACK_RATES = {
    INR: 1.0,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    JPY: 1.85,
    AUD: 0.018,
    CAD: 0.016,
    CHF: 0.011,
    CNY: 0.086,
    SEK: 0.13
};

/**
 * Fetch live exchange rates from Frankfurter API
 * @param {string} baseCurrency - Base currency code (default: INR)
 * @returns {Promise<Object>} Exchange rates object
 */
export const fetchExchangeRates = async (baseCurrency = 'INR') => {
    try {
        const response = await fetch(`${API_BASE_URL}/latest?from=${baseCurrency}`);

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        return {
            base: data.base,
            rates: data.rates,
            date: data.date
        };
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        throw error;
    }
};

/**
 * Get cached exchange rates from localStorage
 * @returns {Object|null} Cached rates or null if not found/expired
 */
export const getCachedRates = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const { rates, timestamp } = JSON.parse(cached);

        // Check if cache is still valid
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return rates;
    } catch (error) {
        console.error('Error reading cached rates:', error);
        return null;
    }
};

/**
 * Save exchange rates to localStorage cache
 * @param {Object} rates - Exchange rates object
 */
export const setCachedRates = (rates) => {
    try {
        const cacheData = {
            rates,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error caching rates:', error);
    }
};

/**
 * Get fallback exchange rates
 * @returns {Object} Static fallback rates
 */
export const getFallbackRates = () => {
    return {
        base: 'INR',
        rates: { ...FALLBACK_RATES },
        date: new Date().toISOString().split('T')[0],
        isFallback: true
    };
};

/**
 * Get exchange rates with caching and fallback
 * @param {string} baseCurrency - Base currency code
 * @returns {Promise<Object>} Exchange rates object
 */
export const getExchangeRates = async (baseCurrency = 'INR') => {
    // Try cache first
    const cached = getCachedRates();
    if (cached && cached.base === baseCurrency) {
        console.log('Using cached exchange rates');
        return cached;
    }

    // Try API
    try {
        console.log('Fetching fresh exchange rates from API');
        const rates = await fetchExchangeRates(baseCurrency);
        setCachedRates(rates);
        return rates;
    } catch (error) {
        console.warn('API failed, using fallback rates');
        return getFallbackRates();
    }
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} rates - Exchange rates object
 * @returns {number} Converted amount
 */
export const convertAmount = (amount, fromCurrency, toCurrency, rates) => {
    if (!amount || amount === 0) return 0;
    if (fromCurrency === toCurrency) return amount;

    // If rates not provided or invalid, return original amount
    if (!rates || !rates.rates) return amount;

    // If converting from base currency
    if (fromCurrency === rates.base) {
        const rate = rates.rates[toCurrency];
        return rate ? amount * rate : amount;
    }

    // If converting to base currency
    if (toCurrency === rates.base) {
        const rate = rates.rates[fromCurrency];
        return rate ? amount / rate : amount;
    }

    // Converting between two non-base currencies
    // First convert to base, then to target
    const fromRate = rates.rates[fromCurrency];
    const toRate = rates.rates[toCurrency];

    if (!fromRate || !toRate) return amount;

    const inBase = amount / fromRate;
    return inBase * toRate;
};

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencySymbol - Currency symbol
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted amount
 */
export const formatCurrency = (amount, currencySymbol, decimals = 2) => {
    if (amount === null || amount === undefined) return `${currencySymbol}0.00`;

    const formatted = Math.abs(amount).toFixed(decimals);
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${currencySymbol}${parts.join('.')}`;
};

/**
 * Get currency code from symbol
 * @param {string} symbol - Currency symbol
 * @returns {string} Currency code
 */
export const getCurrencyCode = (symbol) => {
    const symbolMap = {
        '$': 'USD',
        '€': 'EUR',
        '£': 'GBP',
        '₹': 'INR',
        '¥': 'JPY',
        'A$': 'AUD',
        'C$': 'CAD',
        'CHF': 'CHF',
        '¥': 'CNY',
        'kr': 'SEK'
    };
    return symbolMap[symbol] || 'INR';
};

/**
 * Get currency symbol from code
 * @param {string} code - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (code) => {
    const codeMap = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'INR': '₹',
        'JPY': '¥',
        'AUD': 'A$',
        'CAD': 'C$',
        'CHF': 'CHF',
        'CNY': '¥',
        'SEK': 'kr'
    };
    return codeMap[code] || '₹';
};

/**
 * Clear cached rates (useful for testing or forcing refresh)
 */
export const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
};
