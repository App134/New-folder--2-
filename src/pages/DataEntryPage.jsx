import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import './DataEntryPage.css';
import Footer from '../components/layout/Footer';
import BackButton from '../components/common/BackButton';
import { Wallet, TrendingUp, CreditCard, Save } from 'lucide-react';

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
            {/* Background Shapes */}
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>

            <BackButton />

            <div className="data-entry-content-wrapper">
                <div className="data-entry-header">
                    <h1>Financial Data Entry</h1>
                    <p>Track your flow. Manage your growth.</p>
                </div>

                <div className="tabs-container">
                    <button
                        className={`tab-button ${activeTab === 'expense' ? 'active' : ''}`}
                        onClick={() => setActiveTab('expense')}
                    >
                        <Wallet size={18} />
                        Expense
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        <TrendingUp size={18} />
                        Revenue
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'repayment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('repayment')}
                    >
                        <CreditCard size={18} />
                        Repayment
                    </button>
                </div>

                {/* Expense Form */}
                {activeTab === 'expense' && (
                    <div className="form-card">
                        <div className="form-title">
                            <Wallet size={24} className="form-icon" style={{ color: '#ef4444' }} />
                            New Expense
                        </div>
                        {successMessage && <div className="success-message">✅ {successMessage}</div>}
                        {errorMessage && <div className="error-message">⚠️ {errorMessage}</div>}
                        <form className="form-content" onSubmit={handleExpenseSubmit}>
                            <div className="input-group">
                                <label>Description</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="e.g. Groceries, Rent..."
                                        value={expenseDescription}
                                        onChange={(e) => setExpenseDescription(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="row-group">
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
                                    <div className="input-wrapper">
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
                            </div>

                            <div className="input-group">
                                <label>Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="styled-select"
                                >
                                    <option value="Debit Card">Debit Card</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="Cash">Cash</option>
                                    <option value="From Savings">From Savings</option>
                                </select>
                            </div>

                            {paymentMethod === 'From Savings' && (
                                <div className="input-group">
                                    <label>Source Name</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="e.g. Emergency Fund"
                                            value={savingsSource}
                                            onChange={(e) => setSavingsSource(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                            <button type="submit" className="submit-btn expense-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Add Expense'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Revenue Form */}
                {activeTab === 'revenue' && (
                    <div className="form-card">
                        <div className="form-title">
                            <TrendingUp size={24} className="form-icon" style={{ color: '#10b981' }} />
                            Record Revenue
                        </div>
                        {successMessage && <div className="success-message">✅ {successMessage}</div>}
                        {errorMessage && <div className="error-message">⚠️ {errorMessage}</div>}
                        <form className="form-content" onSubmit={handleRevenueSubmit}>
                            <div className="row-group">
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
                                    <div className="input-wrapper">
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
                            </div>
                            <button type="submit" className="submit-btn revenue-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Add Revenue'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Repayment Form */}
                {activeTab === 'repayment' && (
                    <div className="form-card">
                        <div className="form-title">
                            <CreditCard size={24} className="form-icon" style={{ color: '#8b5cf6' }} />
                            Card Repayment
                        </div>
                        {successMessage && <div className="success-message">✅ {successMessage}</div>}
                        {errorMessage && <div className="error-message">⚠️ {errorMessage}</div>}
                        <form className="form-content" onSubmit={handleRepaymentSubmit}>
                            <div className="row-group">
                                <div className="input-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={repaymentDate}
                                        onChange={(e) => setRepaymentDate(e.target.value)}
                                        className="styled-input"
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Repayment Amount</label>
                                    <div className="input-wrapper">
                                        {formatCurrencyInput}
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={repaymentAmount}
                                            onChange={(e) => setRepaymentAmount(e.target.value)}
                                            required
                                            style={{ paddingLeft: '2.5rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="submit-btn repayment-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : 'Record Payment'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="footer-section">
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default DataEntryPage;
