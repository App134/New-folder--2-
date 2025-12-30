import React, { useState } from 'react';
import { db } from '../../config/firebase'; // Adjust path if needed
import { collection, addDoc, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { Database, CloudUpload, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

const GoogleSheetSync = ({ onDataSynced }) => {
    const [sheetUrl, setSheetUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSync = async () => {
        if (!sheetUrl) {
            setStatus({ type: 'error', msg: 'Please enter a valid Google Sheet CSV URL' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', msg: 'Fetching data from Google Sheets...' });

        try {
            // 1. Fetch CSV Data
            const response = await fetch(sheetUrl);
            if (!response.ok) throw new Error('Failed to fetch Sheet. Ensure it is "Published to Web" as CSV.');
            const text = await response.text();

            // 2. Parse CSV
            console.log("Raw CSV Text:", text); // Debugging

            // Handle different line endings (CRLF vs LF)
            const rows = text.split(/\r?\n/);

            if (rows.length === 0) throw new Error('CSV is empty');

            const headers = rows[0].split(',').map(h => h.trim());
            console.log("Headers:", headers); // Debugging

            const data = rows.slice(1)
                .map(rowStr => rowStr.split(','))
                .filter(row => row.length === headers.length && row.some(cell => cell.trim() !== "")) // Filter empty rows or mismatched columns
                .map(row => {
                    const obj = {};
                    headers.forEach((header, i) => {
                        // Try to parse number if possible
                        const val = row[i]?.trim();
                        obj[header] = (val !== "" && !isNaN(Number(val))) ? Number(val) : val;
                    });
                    return obj;
                });

            console.log("Parsed Data:", data); // Debugging

            if (data.length === 0) throw new Error('No valid data found in the sheet. Check if headers match the data rows.');

            setStatus({ type: 'info', msg: `Found ${data.length} records. Syncing to Firestore...` });

            // 3. Clear existing Firestore Collection (Optional: or append)
            // For this demo, we'll replace "sheet_data" collection content or just add to it.
            // Let's use a batch write to add new documents.
            const batch = writeBatch(db);
            const collectionRef = collection(db, 'sheet_data');

            // Optional: Delete old data first? 
            // setStatus({ type: 'info', msg: 'Clearing old data...' });
            // const q = await getDocs(collectionRef);
            // q.forEach((doc) => batch.delete(doc.ref));

            data.forEach((item) => {
                const docRef = doc(collectionRef); // Generate new ID
                batch.set(docRef, { ...item, syncedAt: new Date() });
            });

            await batch.commit();

            setStatus({ type: 'success', msg: `Successfully synced ${data.length} records to Firestore!` });
            if (onDataSynced) onDataSynced(data, headers);

        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', msg: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                    <Database size={24} color="var(--accent-success)" />
                </div>
                <h3>Google Sheets Sync</h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Connect a Google Sheet to sync data directly to your Firestore database.
                <br />
                <a
                    href="https://support.google.com/docs/answer/183965?hl=en&co=GENIE.Platform%3DDesktop"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                    How to publish to web as CSV <ExternalLink size={12} />
                </a>
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Paste your Published CSV URL here..."
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
                    Sync
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
    );
};

export default GoogleSheetSync;
