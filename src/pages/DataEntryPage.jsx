import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Wallet, TrendingUp, CreditCard, Save, Calendar, DollarSign, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CleanInvalidImports from '../components/utils/CleanInvalidImports';

const DataEntryPage = () => {
    const { addRevenueData, addExpenseData, repayCreditCard, currency } = useData();
    const [activeTab, setActiveTab] = useState('expense');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Common Date State (Default to Today)
    const today = new Date().toISOString().split('T')[0];

    // Expense Form State
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseDate, setExpenseDate] = useState(today);
    const [expenseAmount, setExpenseAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Debit Card');
    const [savingsSource, setSavingsSource] = useState('');

    // Revenue Form State
    const [revenueDate, setRevenueDate] = useState(today);
    const [revenueIncome, setRevenueIncome] = useState('');

    // Repayment Form State
    const [repaymentDate, setRepaymentDate] = useState(today);
    const [repaymentAmount, setRepaymentAmount] = useState('');

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);
        try {
            await addExpenseData(null, expenseDescription, expenseAmount, expenseDate, paymentMethod, paymentMethod === 'From Savings' ? savingsSource : '');
            setExpenseDescription('');
            setExpenseDate(today);
            setExpenseAmount('');
            showSuccess('Expense successfully added!');
        } catch (err) {
            console.error("Failed to add expense:", err);
            setErrorMessage('Failed to save expense: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevenueSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);
        try {
            await addRevenueData(null, revenueIncome, 0, revenueDate);
            setRevenueDate(today);
            setRevenueIncome('');
            showSuccess('Revenue successfully added!');
        } catch (err) {
            console.error("Failed to add revenue:", err);
            setErrorMessage('Failed to save revenue: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRepaymentSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);
        try {
            await repayCreditCard(repaymentAmount, repaymentDate);
            setRepaymentDate(today);
            setRepaymentAmount('');
            showSuccess('Repayment recorded successfully!');
        } catch (err) {
            console.error("Failed to add repayment:", err);
            setErrorMessage('Failed to save repayment: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 lg:p-10 min-h-screen bg-background text-primary-foreground font-sans">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Financial Data Entry</h1>
                <p className="text-muted text-sm mt-1">Track your flow. Manage your growth.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {['expense', 'revenue', 'repayment', 'cleanup'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-wide
                            ${activeTab === tab
                                ? 'bg-primary/20 text-primary border border-primary/50 shadow-neon'
                                : 'bg-white/5 text-muted hover:bg-white/10 hover:text-foreground border border-white/5'
                            }`}
                    >
                        {tab === 'expense' && <Wallet size={18} />}
                        {tab === 'revenue' && <TrendingUp size={18} />}
                        {tab === 'repayment' && <CreditCard size={18} />}
                        {tab === 'cleanup' && <Wrench size={18} />}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Form Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-panel p-8 rounded-[32px] max-w-2xl border border-white/10 shadow-lg relative overflow-hidden"
            >
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-8">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center 
                        ${activeTab === 'expense' ? 'bg-danger/10 text-danger shadow-[0_0_15px_-5px_var(--danger)]' :
                            activeTab === 'revenue' ? 'bg-success/10 text-success shadow-[0_0_15px_-5px_var(--success)]' :
                                'bg-primary/10 text-primary shadow-neon'}`}>
                        {activeTab === 'expense' && <Wallet size={24} />}
                        {activeTab === 'revenue' && <TrendingUp size={24} />}
                        {activeTab === 'repayment' && <CreditCard size={24} />}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground capitalize">Record {activeTab}</h2>
                </div>

                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-xl mb-6 flex items-center gap-3"
                        >
                            <CheckCircle size={20} />
                            {successMessage}
                        </motion.div>
                    )}
                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl mb-6 flex items-center gap-3"
                        >
                            <AlertTriangle size={20} />
                            {errorMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {activeTab === 'expense' && (
                    <form onSubmit={handleExpenseSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Description</label>
                            <input
                                type="text"
                                placeholder="e.g. Groceries, Rent..."
                                value={expenseDescription}
                                onChange={(e) => setExpenseDescription(e.target.value)}
                                required
                                autoFocus
                                className="w-full bg-background-card border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder-white/10"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Date</label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input
                                        type="date"
                                        value={expenseDate}
                                        onChange={(e) => setExpenseDate(e.target.value)}
                                        required
                                        className="w-full bg-background-card border border-white/10 rounded-xl pl-12 pr-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-lg">{currency}</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={expenseAmount}
                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                        required
                                        className="w-full bg-background-card border border-white/10 rounded-xl pl-10 pr-4 py-3 text-foreground font-bold text-lg focus:outline-none focus:border-primary/50 transition-colors placeholder-white/10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full bg-background-card border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="Debit Card" className="bg-background-card">Debit Card</option>
                                <option value="Credit Card" className="bg-background-card">Credit Card</option>
                                <option value="Cash" className="bg-background-card">Cash</option>
                                <option value="From Savings" className="bg-background-card">From Savings</option>
                            </select>
                        </div>

                        {paymentMethod === 'From Savings' && (
                            <div>
                                <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Source Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Emergency Fund"
                                    value={savingsSource}
                                    onChange={(e) => setSavingsSource(e.target.value)}
                                    required
                                    className="w-full bg-background-card border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder-white/10"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:shadow-[0_0_20px_var(--danger)] text-foreground font-bold py-4 rounded-xl transition-all disabled:opacity-70 mt-4"
                        >
                            {isSubmitting ? 'Saving...' : 'Add Expense'}
                        </button>
                    </form>
                )}

                {activeTab === 'revenue' && (
                    <form onSubmit={handleRevenueSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Date</label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input
                                        type="date"
                                        value={revenueDate}
                                        onChange={(e) => setRevenueDate(e.target.value)}
                                        required
                                        className="w-full bg-background-card border border-white/10 rounded-xl pl-12 pr-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Income Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-lg">{currency}</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={revenueIncome}
                                        onChange={(e) => setRevenueIncome(e.target.value)}
                                        required
                                        className="w-full bg-background-card border border-white/10 rounded-xl pl-10 pr-4 py-3 text-foreground font-bold text-lg focus:outline-none focus:border-primary/50 transition-colors placeholder-white/10"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-[0_0_20px_var(--success)] text-foreground font-bold py-4 rounded-xl transition-all disabled:opacity-70 mt-4"
                        >
                            {isSubmitting ? 'Saving...' : 'Add Revenue'}
                        </button>
                    </form>
                )}

                {activeTab === 'repayment' && (
                    <form onSubmit={handleRepaymentSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Date</label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input
                                        type="date"
                                        value={repaymentDate}
                                        onChange={(e) => setRepaymentDate(e.target.value)}
                                        required
                                        className="w-full bg-background-card border border-white/10 rounded-xl pl-12 pr-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Repayment Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-lg">{currency}</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={repaymentAmount}
                                        onChange={(e) => setRepaymentAmount(e.target.value)}
                                        required
                                        className="w-full bg-background-card border border-white/10 rounded-xl pl-10 pr-4 py-3 text-foreground font-bold text-lg focus:outline-none focus:border-primary/50 transition-colors placeholder-white/10"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-500 hover:shadow-[0_0_20px_var(--primary)] text-foreground font-bold py-4 rounded-xl transition-all disabled:opacity-70 mt-4"
                        >
                            {isSubmitting ? 'Processing...' : 'Record Payment'}
                        </button>
                    </form>
                )}

                {activeTab === 'cleanup' && (
                    <div>
                        <CleanInvalidImports />
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default DataEntryPage;
