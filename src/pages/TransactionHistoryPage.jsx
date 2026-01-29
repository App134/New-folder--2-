import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { FileText, ArrowUpCircle, ArrowDownCircle, Filter, Search } from 'lucide-react';
import './TransactionHistoryPage.css';

const TransactionHistoryPage = () => {
    const { allTransactions, currency } = useData();
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const MONTHS = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(t => {
            const matchesMonth = selectedMonth === 'All' || t.month === selectedMonth;
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesMonth && matchesSearch;
        });
    }, [allTransactions, selectedMonth, searchTerm]);

    return (
        <div className="transaction-page-container">
            <div className="transaction-header">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1>Transaction History</h1>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Running Balance & Details
                    </span>
                </div>
                <div className="header-actions">
                    <div style={{ position: 'relative' }}>
                        <select
                            className="month-filter"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Search Bar - Optional but good for 'App-like' feel */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.8rem 1rem 0.8rem 2.8rem',
                        borderRadius: '0.8rem',
                        border: 'none',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                />
            </div>

            <div className="transactions-list">
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t, index) => (
                        <div key={t.id + index} className="transaction-item">
                            <div className="t-left">
                                <div className={`t-icon ${t.type}`}>
                                    {t.type === 'credit' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                                </div>
                                <div className="t-details">
                                    <span className="t-description">{t.description}</span>
                                    <span className="t-date">{new Date(t.date).toLocaleDateString()} • {t.category}</span>
                                </div>
                            </div>
                            <div className="t-right">
                                <div className={`t-amount ${t.type}`}>
                                    {t.type === 'credit' ? '+' : '-'} {currency}{t.amount.toLocaleString()}
                                </div>
                                <div className="t-balance">
                                    Bal: {currency}{t.runningBalance.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No transactions found for this period.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistoryPage;
