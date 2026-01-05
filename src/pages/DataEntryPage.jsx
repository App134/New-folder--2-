import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import './DataEntryPage.css';
import Footer from '../components/layout/Footer';
import BackButton from '../components/common/BackButton';

const DataEntryPage = () => {
    const { addRevenueData, addExpenseData, addTrendData } = useData();
    const [activeTab, setActiveTab] = useState('expense');
    const [successMessage, setSuccessMessage] = useState('');

    // Expense Form State
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseMonth, setExpenseMonth] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');

    // Revenue Form State
    const [revenueMonth, setRevenueMonth] = useState('');
    const [revenueIncome, setRevenueIncome] = useState('');

    // Savings Form State
    const [savingsMonth, setSavingsMonth] = useState('');
    const [savingsAmount, setSavingsAmount] = useState('');

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        addExpenseData(expenseMonth, expenseDescription, expenseAmount);
        setExpenseDescription('');
        setExpenseMonth('');
        setExpenseAmount('');
        showSuccess('Expense successfully added!');
    };

    const handleRevenueSubmit = (e) => {
        e.preventDefault();
        addRevenueData(revenueMonth, revenueIncome, 0);
        setRevenueMonth('');
        setRevenueIncome('');
        showSuccess('Revenue successfully added!');
    };

    const handleSavingsSubmit = (e) => {
        e.preventDefault();
        addTrendData(savingsMonth, savingsAmount);
        setSavingsMonth('');
        setSavingsAmount('');
        showSuccess('Savings successfully added!');
    };

    return (
        <div className="data-entry-container">
            <BackButton />
            <div className="data-entry-header">
                <h1>Financial Data Entry</h1>
                <p>Manage your expenses, revenue, and savings in one place.</p>
            </div>

            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'expense' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expense')}
                >
                    Add Expense
                </button>
                <button
                    className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
                    onClick={() => setActiveTab('revenue')}
                >
                    Add Revenue
                </button>
                <button
                    className={`tab-button ${activeTab === 'savings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('savings')}
                >
                    Add Savings
                </button>
            </div>

            {/* Expense Form */}
            {activeTab === 'expense' && (
                <div className="form-card">
                    <div className="form-title">💸 New Expense</div>
                    {successMessage && <div className="success-message">✅ {successMessage}</div>}
                    <form className="form-content" onSubmit={handleExpenseSubmit}>
                        <div className="input-group">
                            <label>Description</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="e.g. Groceries, Rent, Utilities"
                                    value={expenseDescription}
                                    onChange={(e) => setExpenseDescription(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Month (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Aug (Default: Current)"
                                value={expenseMonth}
                                onChange={(e) => setExpenseMonth(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn">Add Expense</button>
                    </form>
                </div>
            )}

            {/* Revenue Form */}
            {activeTab === 'revenue' && (
                <div className="form-card">
                    <div className="form-title">💰 Record Revenue</div>
                    {successMessage && <div className="success-message">✅ {successMessage}</div>}
                    <form className="form-content" onSubmit={handleRevenueSubmit}>
                        <div className="input-group">
                            <label>Month</label>
                            <input
                                type="text"
                                placeholder="e.g. Aug"
                                value={revenueMonth}
                                onChange={(e) => setRevenueMonth(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="input-group">
                            <label>Income Amount</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={revenueIncome}
                                onChange={(e) => setRevenueIncome(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn" style={{ background: 'linear-gradient(135deg, var(--accent-secondary), #059669)' }}>
                            Add Revenue
                        </button>
                    </form>
                </div>
            )}

            {/* Savings Form */}
            {activeTab === 'savings' && (
                <div className="form-card">
                    <div className="form-title">🏦 Update Savings</div>
                    {successMessage && <div className="success-message">✅ {successMessage}</div>}
                    <form className="form-content" onSubmit={handleSavingsSubmit}>
                        <div className="input-group">
                            <label>Month</label>
                            <input
                                type="text"
                                placeholder="e.g. Aug"
                                value={savingsMonth}
                                onChange={(e) => setSavingsMonth(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="input-group">
                            <label>Total Savings</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={savingsAmount}
                                onChange={(e) => setSavingsAmount(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn" style={{ background: 'linear-gradient(135deg, var(--accent-tertiary), #7c3aed)' }}>
                            Add Savings
                        </button>
                    </form>
                </div>
            )}
            <div style={{ marginTop: 'auto', width: '100%' }}>
                <Footer />
            </div>
        </div>
    );
};

export default DataEntryPage;
