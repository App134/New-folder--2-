import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Database, CloudUpload, RefreshCw, ExternalLink, Download, FileSpreadsheet, HelpCircle, X, Copy, Check } from 'lucide-react';

const GoogleSheetSync = ({ onDataSynced }) => {
    // Import Data State
    const [sheetUrl, setSheetUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [previewData, setPreviewData] = useState(null); // Track previewed data
    const [previewCount, setPreviewCount] = useState(0); // Count of new records
    const lastTempDataRef = useRef('');

    // Export Data State
    const [scriptUrl, setScriptUrl] = useState('');
    const [exportLoading, setExportLoading] = useState(false);
    const [exportStatus, setExportStatus] = useState({ type: '', msg: '' });
    const [showGuide, setShowGuide] = useState(false);
    const [copied, setCopied] = useState(false);

    // Use context
    const { importData, aggregatedData, setTemporaryData, allTransactions } = useData();

    // Auto-load URL from LocalStorage (but don't fetch data)
    useEffect(() => {
        const savedUrl = localStorage.getItem('googleSheetUrl');
        if (savedUrl) {
            setSheetUrl(savedUrl);
            // REMOVED: Auto-fetch on page load
            // User must click "Preview" to fetch data
        }
    }, []);

    const fetchAndSetData = async (url, saveToDb = false) => {
        if (!url) return;
        setLoading(true);
        if (saveToDb) setStatus({ type: 'info', msg: 'Checking for new data...' });

        try {
            // 0. Auto-correct URL if it's a standard Google Sheet link
            let fetchUrl = url;
            const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (sheetIdMatch && sheetIdMatch[1]) {
                if (!url.includes('export?format=csv') && !url.includes('output=csv')) {
                    fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv`;
                }
            }

            // 1. Fetch CSV Data
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error('Failed to fetch Sheet. Ensure it is "Published to Web" as CSV.');
            const text = await response.text();

            if (text.trim().toLowerCase().startsWith('<!doctype html') || text.trim().toLowerCase().startsWith('<html')) {
                throw new Error('URL returned HTML. Ensure sheet is "Published to Web" as CSV.');
            }

            // 2. Parse CSV
            const rows = text.split(/\r?\n/).filter(r => r.trim() !== '');
            if (rows.length === 0) throw new Error('CSV is empty');

            // Helper to parse CSV line respecting quotes
            const parseCSVLine = (line) => {
                const result = [];
                let current = '';
                let inQuote = false;

                for (let i = 0; i < line.length; i++) {
                    const char = line[i];

                    if (char === '"') {
                        // Toggle quote status
                        inQuote = !inQuote;
                    } else if (char === ',' && !inQuote) {
                        // Found separator outside quote
                        result.push(current.trim());
                        current = '';
                    } else {
                        // Append char
                        current += char;
                    }
                }
                result.push(current.trim());
                return result;
            };

            const headers = parseCSVLine(rows[0]);

            const parsedData = rows.slice(1)
                .map(rowStr => parseCSVLine(rowStr))
                .filter(row => row.some(cell => cell !== ""))
                .map(row => {
                    const obj = {};
                    headers.forEach((header, i) => {
                        let val = row[i] || '';
                        // Remove potential remaining quotes if naive logic missed something or double quotes
                        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                        obj[header] = val;
                    });
                    return obj;
                });

            // 3. Process and Filter Data (Incremental Logic)

            // Create a Set of existing transaction signatures to prevent duplicates
            // Signature format: "YYYY-MM-DD|Description|Amount|Type"
            const existingSignatures = new Set();
            if (allTransactions && allTransactions.length > 0) {
                allTransactions.forEach(t => {
                    const dateStr = new Date(t.date).toISOString().split('T')[0]; // Compare dates (YYYY-MM-DD)
                    const desc = (t.description || '').trim().toLowerCase();
                    const amt = Number(t.amount).toFixed(2);
                    const type = t.type || (t.category === 'Income' ? 'credit' : 'debit');

                    const signature = `${dateStr}|${desc}|${amt}|${type}`;
                    existingSignatures.add(signature);
                });
            }

            const newItems = parsedData.map(item => {
                // Smart Map Keys
                const getVal = (keys) => {
                    const key = Object.keys(item).find(k => keys.some(search => k.toLowerCase().includes(search)));
                    return item[key];
                };

                const parseAmount = (val) => {
                    if (!val) return 0;
                    if (typeof val === 'number') return val;
                    const str = String(val).replace(/[^0-9.-]/g, '');
                    return parseFloat(str) || 0;
                };

                const dateVal = getVal(['date', 'timestamp', 'time', 'createdat']);
                const incVal = parseAmount(getVal(['income', 'revenue', 'credit']));
                const expVal = parseAmount(getVal(['expense', 'debit', 'cost']));
                const savVal = parseAmount(getVal(['savings', 'save']));
                const descVal = getVal(['description', 'desc', 'category', 'details']);

                let finalDate = new Date().toISOString();
                if (dateVal) {
                    const parsed = new Date(dateVal);
                    if (!isNaN(parsed.getTime())) finalDate = parsed.toISOString();
                }

                return {
                    month: new Date(finalDate).toLocaleString('default', { month: 'short' }),
                    income: incVal,
                    expense: expVal,
                    savings: savVal,
                    description: descVal || 'Sheet Data',
                    category: descVal || 'Imported',
                    createdAt: finalDate
                    // Removed temporary ID - Firestore will generate the real document ID
                };
            })
                .filter(item => {
                    // FILTER: Check if this item presumably exists in DB by checking signatures
                    const dateStr = new Date(item.createdAt).toISOString().split('T')[0];
                    const desc = (item.description || 'sheet data').trim().toLowerCase();

                    // Helper to check and return TRUE if found (Duplicate) -> FALSE to keep
                    const isDuplicate = (amount, type) => {
                        const amt = Number(amount).toFixed(2);
                        const sig = `${dateStr}|${desc}|${amt}|${type}`;
                        return existingSignatures.has(sig);
                    };

                    // Check Income
                    if (item.income > 0) {
                        if (isDuplicate(item.income, 'credit')) return false;
                    }
                    // Check Expense
                    if (item.expense > 0) {
                        // In DB, expenses are 'debit'
                        if (isDuplicate(item.expense, 'debit')) return false;
                    }

                    // Check Savings (treat as debit/transfer)
                    if (item.savings > 0) {
                        if (isDuplicate(item.savings, 'debit')) return false;
                    }

                    // If no duplicates found for its values, keep it.
                    return true;
                });

            // 4. Action
            if (newItems.length === 0) {
                if (saveToDb) {
                    setStatus({ type: 'success', msg: 'Data is up to date. No new records found.' }); // Consistent Msg
                } else {
                    // For Preview, if no new items, we intentionally set empty
                    const newStr = JSON.stringify([]);
                    if (newStr !== lastTempDataRef.current) {
                        setTemporaryData([]);
                        lastTempDataRef.current = newStr;
                        setStatus({ type: 'info', msg: 'Live View: All sheet data is already in Database.' });
                    }
                }
            } else {
                if (saveToDb) {
                    await importData(newItems);
                    setStatus({ type: 'success', msg: `Synced ${newItems.length} new records!` });
                    localStorage.setItem('googleSheetUrl', url);
                    if (onDataSynced) onDataSynced(newItems, headers);
                    // Clear preview cache on save so next preview matches
                    lastTempDataRef.current = '';
                } else {
                    // Preview mode - store data for later save
                    setPreviewData(newItems);
                    setPreviewCount(newItems.length);
                    const newStr = JSON.stringify(newItems);
                    if (newStr !== lastTempDataRef.current) {
                        setTemporaryData(newItems);
                        lastTempDataRef.current = newStr;
                        setStatus({ type: 'success', msg: `Preview: Found ${newItems.length} new records ready to import.` });
                    }
                }
            }

        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', msg: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSync = () => {
        // Save to DB
        fetchAndSetData(sheetUrl, true);
    };

    const handlePreview = () => {
        // Fetch and preview data (don't save to DB)
        setPreviewData(null); // Clear previous preview
        setPreviewCount(0);
        fetchAndSetData(sheetUrl, false);
        localStorage.setItem('googleSheetUrl', sheetUrl);
    };

    const handleSave = () => {
        // Save previewed data to DB
        if (!previewData || previewData.length === 0) {
            setStatus({ type: 'error', msg: 'No preview data to save. Click "Preview Data" first.' });
            return;
        }
        fetchAndSetData(sheetUrl, true);
    };

    // --- EXPORT LOGIC ---
    const handleExport = async () => {
        if (!scriptUrl) {
            setExportStatus({ type: 'error', msg: 'Please enter a valid Apps Script URL' });
            return;
        }

        if (!aggregatedData || aggregatedData.length === 0) {
            setExportStatus({ type: 'error', msg: 'No data available to export.' });
            return;
        }

        setExportLoading(true);
        setExportStatus({ type: 'info', msg: 'Preparing data...' });

        try {
            // Format Data
            const formattedData = aggregatedData.map(item => ({
                date: item.lastUpdated ? item.lastUpdated.split('T')[0] : new Date().toISOString().split('T')[0], // YYYY-MM-DD
                income: item.income || 0,
                expense: item.expense || 0,
                savings: item.savings || 0
            }));

            // Send to Apps Script
            // Note: mode: 'no-cors' is required for simple Apps Script Web App triggers without detailed CORS setup.
            // This means we won't get a readable JSON response, but the request will go through.
            await fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData)
            });

            // Since we can't read the response in no-cors, we assume success if no network error occurred.
            setExportStatus({ type: 'success', msg: 'Data sent to Google Sheet! Check your sheet.' });

        } catch (error) {
            console.error(error);
            setExportStatus({ type: 'error', msg: 'Failed to send data: ' + error.message });
        } finally {
            setExportLoading(false);
        }
    };

    const copyCode = () => {
        const code = `
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rawData = JSON.parse(e.postData.contents);
  
  // Headers
  var headers = ["Date", "Income", "Expenses", "Savings"];
  if (sheet.getLastRow() === 0) {
     sheet.appendRow(headers);
  }
  
  // Clear previous data (keep header)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).clearContent();
  }
  
  var rows = rawData.map(function(item) {
    return [item.date, item.income, item.expense, item.savings];
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
    // Format Date Column
    sheet.getRange(2, 1, rows.length, 1).setNumberFormat("yyyy-mm-dd"); 
    // Format Numbers
    sheet.getRange(2, 2, rows.length, 3).setNumberFormat("#,##0.00");
  }
  
  return ContentService.createTextOutput("Success");
}`;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-4 sm:gap-6">

            {/* --- EXPORT SECTION (NEW) --- */}
            <div className="p-4 sm:p-6 bg-secondary rounded-xl border border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                            <FileSpreadsheet size={20} className="sm:w-6 sm:h-6 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-primary m-0">Export to Google Sheets</h3>
                            <p className="text-xs sm:text-sm text-muted m-0 truncate">Send your dashboard data to a Sheet</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="flex items-center gap-1 text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer text-sm self-start sm:self-auto"
                    >
                        <HelpCircle size={16} />Setup Guide
                    </button>
                </div>

                {/* GUIDE COLLAPSIBLE */}
                {showGuide && (
                    <div className="bg-primary p-3 sm:p-4 rounded-lg mb-4 border border-border">
                        <h4 className="mt-0 mb-3 text-sm sm:text-base font-semibold">How to Setup Export:</h4>
                        <ol className="pl-5 text-muted text-xs sm:text-sm leading-relaxed space-y-1">
                            <li>Create a new Google Sheet.</li>
                            <li>Go to <strong>Extensions {'>'} Apps Script</strong>.</li>
                            <li>Paste the code below into the editor.</li>
                            <li>Click <strong>Deploy {'>'} New Deployment</strong>.</li>
                            <li>Select type: <strong>Web App</strong>.</li>
                            <li>Set "Execute as": <strong>Me</strong>.</li>
                            <li>Set "Who has access": <strong>Anyone</strong> (Important!).</li>
                            <li>Click <strong>Deploy</strong> and copy the <strong>Web App URL</strong>.</li>
                        </ol>
                        <div className="relative mt-2">
                            <button
                                onClick={copyCode}
                                className="absolute top-2 right-2 px-2 py-1 text-xs cursor-pointer bg-secondary border border-border rounded flex items-center gap-1 text-primary hover:bg-card transition-colors z-10"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Code'}
                            </button>
                            <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-3 sm:p-4 rounded-md overflow-x-auto text-[10px] sm:text-xs">
                                {`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rawData = JSON.parse(e.postData.contents);
  var headers = ["Date", "Income", "Expenses", "Savings"];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).clearContent();
  var rows = rawData.map(d => [d.date, d.income, d.expense, d.savings]);
  if (rows.length) {
    var range = sheet.getRange(2, 1, rows.length, 4);
    range.setValues(rows);
    sheet.getRange(2, 1, rows.length, 1).setNumberFormat("yyyy-mm-dd");
    sheet.getRange(2, 2, rows.length, 3).setNumberFormat("#,##0.00");
  }
  return ContentService.createTextOutput("Success");
}`}
                            </pre>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Paste Web App URL here..."
                        value={scriptUrl}
                        onChange={(e) => setScriptUrl(e.target.value)}
                        className="flex-1 px-3 py-2 sm:py-3 rounded-lg border border-border bg-primary text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleExport}
                        disabled={exportLoading}
                        className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-500 text-white border-none cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:cursor-wait text-sm sm:text-base whitespace-nowrap"
                    >
                        {exportLoading ? <RefreshCw className="spin" size={18} /> : <Download size={18} />}
                        <span className="hidden sm:inline">Export</span>
                        <span className="sm:hidden">Export</span>
                    </button>
                </div>

                {exportStatus.msg && (
                    <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2 ${exportStatus.type === 'error'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}>
                        {exportStatus.type === 'error' ? '⚠️' : '✅'}
                        <span className="break-words">{exportStatus.msg}</span>
                    </div>
                )}
            </div>

            {/* --- SYNC SECTION (EXISTING) --- */}
            <div className="p-4 sm:p-6 bg-secondary rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/10 rounded-lg flex-shrink-0">
                        <Database size={20} className="sm:w-6 sm:h-6 text-green-500" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-primary m-0">Import from Google Sheets</h3>
                        <p className="text-xs sm:text-sm text-muted m-0 truncate">Sync data from a published CSV</p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Paste Published CSV URL here..."
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                        className="w-full px-3 py-2 sm:py-3 rounded-lg border border-border bg-primary text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handlePreview}
                            disabled={loading}
                            className="flex-1 px-4 py-2 sm:py-3 rounded-lg bg-secondary border border-primary text-primary cursor-pointer flex items-center justify-center gap-2 hover:bg-card transition-colors disabled:opacity-70 disabled:cursor-wait text-sm whitespace-nowrap"
                        >
                            {loading ? <RefreshCw className="spin" size={18} /> : <ExternalLink size={18} />}
                            Preview Data
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || !previewData || previewCount === 0}
                            className={`flex-1 px-4 py-2 sm:py-3 rounded-lg border-none flex items-center justify-center gap-2 transition-colors text-sm whitespace-nowrap ${(previewData && previewCount > 0)
                                    ? 'bg-primary text-white cursor-pointer hover:opacity-90'
                                    : 'bg-secondary text-muted cursor-not-allowed opacity-50'
                                }`}
                        >
                            {loading ? <RefreshCw className="spin" size={18} /> : <CloudUpload size={18} />}
                            Save to DB
                        </button>
                    </div>
                </div>

                {status.msg && (
                    <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2 ${status.type === 'error'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                        {status.type === 'error' ? '⚠️' : '✅'}
                        <span className="break-words">{status.msg}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleSheetSync;
