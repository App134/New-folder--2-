import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { FileText, ArrowUpCircle, ArrowDownCircle, Filter, Search, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SourceBadge from '../components/common/SourceBadge';

const TransactionHistoryPage = () => {
    const { allTransactions, currency, deleteTransaction, convertValue } = useData();
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, transaction: null });
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    const MONTHS = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(t => {


            const matchesMonth = selectedMonth === 'All' || t.month === selectedMonth;
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesMonth && matchesSearch;
        });
    }, [allTransactions, selectedMonth, searchTerm]);

    const handleDeleteClick = (transaction) => {
        setConfirmDialog({ isOpen: true, transaction });
        setError(null);
    };

    const handleConfirmDelete = async () => {
        const transaction = confirmDialog.transaction;
        if (!transaction || !transaction.originalDoc?.id) {
            setError('Invalid transaction. Cannot delete.');
            setConfirmDialog({ isOpen: false, transaction: null });
            return;
        }

        setDeletingId(transaction.id);
        setConfirmDialog({ isOpen: false, transaction: null });

        try {
            await deleteTransaction(transaction.originalDoc.id);
            // Success - the real-time listener will update the UI automatically
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete transaction. Please check your connection and try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDialog({ isOpen: false, transaction: null });
    };

    return (
        <div className="p-6 lg:p-10 h-full min-h-screen bg-background text-primary-foreground">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Finance History</h1>
                    <p className="text-muted text-sm mt-1">Track all your income and expenses</p>
                </div>
                <div className="flex gap-4 items-center w-full md:w-auto justify-between">
                    <div className="relative">
                        <select
                            className="p-3 rounded-xl bg-background-card text-white border border-white/10 outline-none cursor-pointer hover:bg-white/5 transition-colors focus:ring-2 focus:ring-primary/50"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {MONTHS.map(m => <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8 relative max-w-2xl mx-auto md:mx-0">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    placeholder="Search by name, category, or amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-background-card text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-lg placeholder-muted"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger">
                    <p className="font-semibold">{error}</p>
                </div>
            )}

            <div className="glass-panel rounded-[32px] overflow-hidden shadow-lg border border-white/5">
                {filteredTransactions.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {filteredTransactions.map((t, index) => (
                            <div
                                key={t.id + index}
                                className={`flex justify-between items-center p-4 md:p-6 hover:bg-white/5 transition-all group ${deletingId === t.id ? 'opacity-50 pointer-events-none' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-4 md:gap-6 flex-1">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${t.type === 'credit' ? 'bg-success/10 text-success' :
                                        (t.type === 'Investment' || t.type === 'Saving') ? 'bg-warning/10 text-warning' :
                                            'bg-danger/10 text-danger'
                                        }`}>
                                        {t.type === 'credit' ? <ArrowDownCircle size={24} /> :
                                            (t.type === 'Investment' || t.type === 'Saving') ? <ArrowUpCircle size={24} className="rotate-45" /> :
                                                <ArrowUpCircle size={24} />}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-white text-base md:text-lg group-hover:text-primary transition-colors">{t.description}</span>
                                            <SourceBadge source={t.source} />
                                        </div>
                                        <span className="text-xs md:text-sm text-muted mt-1 font-medium">{new Date(t.date).toLocaleDateString()} • <span className="uppercase tracking-wide opacity-80">{t.category}</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className={`font-bold text-base md:text-lg ${t.type === 'credit' ? 'text-success' :
                                            (t.type === 'Investment' || t.type === 'Saving') ? 'text-warning' :
                                                'text-primary-foreground'
                                            } drop-shadow-sm`}>
                                            {t.type === 'credit' ? '+' : '-'} {currency}{convertValue(t.amount).toLocaleString()}
                                        </div>
                                    </div>
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDeleteClick(t)}
                                        disabled={deletingId === t.id}
                                        className="w-10 h-10 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger flex items-center justify-center transition-all opacity-0 md:group-hover:opacity-100 md:opacity-0 sm:opacity-100 focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Delete transaction"
                                        title="Delete transaction"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-16 text-muted">
                        <div className="w-20 h-20 bg-background-card rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <FileText size={40} className="opacity-40" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">No transactions found</h3>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
            />
        </div>
    );
};

export default TransactionHistoryPage;

