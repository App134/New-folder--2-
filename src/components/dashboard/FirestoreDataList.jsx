import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { RefreshCw, Database } from 'lucide-react';

const FirestoreDataList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to real-time updates from "sheet_data"
        const q = query(collection(db, 'sheet_data'), limit(100)); // Increased limit for better aggregation

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tempMap = {};

            snapshot.forEach((doc) => {
                const item = doc.data();
                // Normalize month: use 'month' field if present, otherwise 'name' or 'Unknown'
                let monthRaw = (item.month || item.name || 'Unknown').trim();

                // Capitalize first letter to normalize (nov -> Nov, NOV -> Nov)
                if (monthRaw && monthRaw.length > 0) {
                    monthRaw = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1).toLowerCase();
                }

                const monthKey = monthRaw;

                if (!tempMap[monthKey]) {
                    tempMap[monthKey] = {
                        id: monthKey, // Use month as ID for the row
                        month: monthKey,
                        income: 0,
                        expense: 0,
                        savings: 0,
                        lastUpdated: item.createdAt // Track latest timestamp if needed
                    };
                }

                tempMap[monthKey].income += Number(item.income) || 0;
                tempMap[monthKey].expense += Number(item.expense) || 0;
                tempMap[monthKey].savings += Number(item.savings) || 0;

                // Keep track of latest update for sorting/display date
                if (item.createdAt && item.createdAt.seconds) {
                    const currentSeconds = tempMap[monthKey].lastUpdated?.seconds || 0;
                    if (item.createdAt.seconds > currentSeconds) {
                        tempMap[monthKey].lastUpdated = item.createdAt;
                    }
                }
            });

            // Convert map to array and sort (optional: sort by month name or recency?)
            // Let's sort by recency of update for now, or alphabetical.
            const aggregatedList = Object.values(tempMap);

            // Simple sort by lastUpdated
            aggregatedList.sort((a, b) => {
                const tA = a.lastUpdated?.seconds || 0;
                const tB = b.lastUpdated?.seconds || 0;
                return tB - tA;
            });

            setData(aggregatedList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching firestore data:", error);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <RefreshCw className="spin" size={24} style={{ marginBottom: '0.5rem' }} />
                <p>Loading data from Firestore...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <Database size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p>No data found in Firebase 'sheet_data' collection.</p>
                <p style={{ fontSize: '0.9rem' }}>Use the Google Sheets Sync above to import data.</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem',
                color: 'var(--text-primary)'
            }}>
                <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Month</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Income</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Expense</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Savings</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={row.id} style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                        }}>
                            <td style={{ padding: '0.75rem', fontWeight: '500' }}>{row.month}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', color: row.income > 0 ? 'var(--accent-success)' : 'inherit' }}>
                                {row.income > 0 ? row.income : '-'}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', color: row.expense > 0 ? 'var(--accent-danger)' : 'inherit' }}>
                                {row.expense > 0 ? row.expense : '-'}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', color: row.savings > 0 ? 'var(--accent-primary)' : 'inherit' }}>
                                {row.savings > 0 ? row.savings : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Aggregated by Month • {data.length} months found
            </div>
        </div>
    );
};

export default FirestoreDataList;
