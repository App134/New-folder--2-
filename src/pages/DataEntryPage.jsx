import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import './DataEntryPage.css';
import Footer from '../components/layout/Footer';
import BackButton from '../components/common/BackButton';

const DataEntryPage = () => {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });

    const { addRevenueData, addExpenseData, addTrendData, currency } = useData();
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

    // Revenue Form State
    const [revenueDate, setRevenueDate] = useState(today);
    const [revenueIncome, setRevenueIncome] = useState('');

    // Savings Form State
    const [savingsDate, setSavingsDate] = useState(today);
    const [savingsAmount, setSavingsAmount] = useState('');

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);
        try {
            await addExpenseData(null, expenseDescription, expenseAmount, expenseDate);
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

    const handleSavingsSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);
        try {
            await addTrendData(null, savingsAmount, savingsDate);
            setSavingsDate(today);
            setSavingsAmount('');
            showSuccess('Savings successfully added!');
        } catch (err) {
            console.error("Failed to add savings:", err);
            setErrorMessage('Failed to save savings: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrencyInput = (
        <span style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontWeight: 'bold'
        }}>
            {currency}
        </span>
    );

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
                    {errorMessage && <div className="error-message" style={{ color: 'var(--accent-danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>⚠️ {errorMessage}</div>}
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
                            <label>Date</label>
                            <input
                                type="date"
                                value={expenseDate}
                                onChange={(e) => setExpenseDate(e.target.value)}
                                className="styled-input"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Amount</label>
                            <div style={{ position: 'relative' }}>
                                {formatCurrencyInput}
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={expenseAmount}
                                    onChange={(e) => setExpenseAmount(e.target.value)}
                                    required
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                        </div>
                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Add Expense'}
                        </button>
                    </form>
                </div>
            )}

            {/* Revenue Form */}
            {activeTab === 'revenue' && (
                <div className="form-card">
                    <div className="form-title">💰 Record Revenue</div>
                    {successMessage && <div className="success-message">✅ {successMessage}</div>}
                    {errorMessage && <div className="error-message" style={{ color: 'var(--accent-danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>⚠️ {errorMessage}</div>}
                    <form className="form-content" onSubmit={handleRevenueSubmit}>
                        <div className="input-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={revenueDate}
                                onChange={(e) => setRevenueDate(e.target.value)}
                                className="styled-input"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Income Amount</label>
                            <div style={{ position: 'relative' }}>
                                {formatCurrencyInput}
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={revenueIncome}
                                    onChange={(e) => setRevenueIncome(e.target.value)}
                                    required
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                        </div>
                        <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, var(--accent-secondary), #059669)', opacity: isSubmitting ? 0.7 : 1 }}>
                            {isSubmitting ? 'Saving...' : 'Add Revenue'}
                        </button>
                    </form>
                </div>
            )}

            {/* Savings Form */}
            {activeTab === 'savings' && (
                <div className="form-card">
                    <div className="form-title">🏦 Update Savings</div>
                    {successMessage && <div className="success-message">✅ {successMessage}</div>}
                    {errorMessage && <div className="error-message" style={{ color: 'var(--accent-danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>⚠️ {errorMessage}</div>}
                    <form className="form-content" onSubmit={handleSavingsSubmit}>
                        <div className="input-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={savingsDate}
                                onChange={(e) => setSavingsDate(e.target.value)}
                                className="styled-input"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Total Savings</label>
                            <div style={{ position: 'relative' }}>
                                {formatCurrencyInput}
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={savingsAmount}
                                    onChange={(e) => setSavingsAmount(e.target.value)}
                                    required
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                        </div>
                        <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, var(--accent-tertiary), #7c3aed)', opacity: isSubmitting ? 0.7 : 1 }}>
                            {isSubmitting ? 'Saving...' : 'Add Savings'}
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
