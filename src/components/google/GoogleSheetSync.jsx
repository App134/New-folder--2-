import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Database, CloudUpload, RefreshCw, ExternalLink, Download, FileSpreadsheet, HelpCircle, X, Copy, Check } from 'lucide-react';

const GoogleSheetSync = ({ onDataSynced }) => {
    // Import Data State
    const [sheetUrl, setSheetUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const lastTempDataRef = useRef('');

    // Export Data State
    const [scriptUrl, setScriptUrl] = useState('');
    const [exportLoading, setExportLoading] = useState(false);
    const [exportStatus, setExportStatus] = useState({ type: '', msg: '' });
    const [showGuide, setShowGuide] = useState(false);
    const [copied, setCopied] = useState(false);

    // Use context
    const { importData, aggregatedData, setTemporaryData, allTransactions } = useData();

    // Auto-load from LocalStorage
    useEffect(() => {
        const savedUrl = localStorage.getItem('googleSheetUrl');
        if (savedUrl) {
            setSheetUrl(savedUrl);
            fetchAndSetData(savedUrl, false); // Fetch for Display Only (Live View) on Mount
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
                    createdAt: finalDate,
                    id: 'sheet-' + Math.random().toString(36).substr(2, 9) // Temp ID
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
                    const newStr = JSON.stringify(newItems);
                    if (newStr !== lastTempDataRef.current) {
                        setTemporaryData(newItems);
                        lastTempDataRef.current = newStr;
                        setStatus({ type: 'success', msg: `Live Preview: ${newItems.length} new records (others already synced).` });
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
        // Live Preview only
        fetchAndSetData(sheetUrl, false);
        localStorage.setItem('googleSheetUrl', sheetUrl);
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
        <div className="google-sync-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* --- EXPORT SECTION (NEW) --- */}
            <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                            <FileSpreadsheet size={24} color="#3b82f6" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Export to Google Sheets</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Send your dashboard data to a Sheet</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                        <HelpCircle size={16} /> Setup Guide
                    </button>
                </div>

                {/* GUIDE COLLAPSIBLE */}
                {showGuide && (
                    <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ marginTop: 0 }}>How to Setup Export:</h4>
                        <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            <li>Create a new Google Sheet.</li>
                            <li>Go to <strong>Extensions {'>'} Apps Script</strong>.</li>
                            <li>Paste the code below into the editor.</li>
                            <li>Click <strong>Deploy {'>'} New Deployment</strong>.</li>
                            <li>Select type: <strong>Web App</strong>.</li>
                            <li>Set "Execute as": <strong>Me</strong>.</li>
                            <li>Set "Who has access": <strong>Anyone</strong> (Important!).</li>
                            <li>Click <strong>Deploy</strong> and copy the <strong>Web App URL</strong>.</li>
                        </ol>
                        <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                            <button
                                onClick={copyCode}
                                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Code'}
                            </button>
                            <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '6px', overflowX: 'auto', fontSize: '0.8rem' }}>
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

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Paste Web App URL here..."
                        value={scriptUrl}
                        onChange={(e) => setScriptUrl(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <button
                        onClick={handleExport}
                        disabled={exportLoading}
                        style={{
                            padding: '0 1.5rem',
                            borderRadius: '8px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            cursor: exportLoading ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: exportLoading ? 0.7 : 1
                        }}
                    >
                        {exportLoading ? <RefreshCw className="spin" size={20} /> : <Download size={20} />}
                        Export
                    </button>
                </div>

                {exportStatus.msg && (
                    <div style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: exportStatus.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: exportStatus.type === 'error' ? 'var(--accent-danger)' : '#3b82f6',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        {exportStatus.type === 'error' ? '⚠️' : '✅'} {exportStatus.msg}
                    </div>
                )}
            </div>

            {/* --- SYNC SECTION (EXISTING) --- */}
            <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                        <Database size={24} color="var(--accent-success)" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>Import from Google Sheets</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sync data from a published CSV</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Paste Published CSV URL here..."
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <button
                        onClick={handlePreview}
                        disabled={loading}
                        style={{
                            padding: '0 1.5rem',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--accent-primary)',
                            color: 'var(--accent-primary)',
                            cursor: loading ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? <RefreshCw className="spin" size={20} /> : <ExternalLink size={20} />}
                        Preview
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={loading}
                        style={{
                            padding: '0 1.5rem',
                            borderRadius: '8px',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            cursor: loading ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? <RefreshCw className="spin" size={20} /> : <CloudUpload size={20} />}
                        Save to DB
                    </button>
                </div>

                {status.msg && (
                    <div style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: status.type === 'error' ? 'var(--accent-danger)' : 'var(--accent-success)',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        {status.type === 'error' ? '⚠️' : '✅'} {status.msg}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleSheetSync;
