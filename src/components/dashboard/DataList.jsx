import React from 'react';
import { useData } from '../../context/DataContext';
import { Database } from 'lucide-react';

const DataList = () => {
    const { aggregatedData } = useData();
    const data = aggregatedData || [];

    if (data.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <Database size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p>No data available.</p>
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

export default DataList;
