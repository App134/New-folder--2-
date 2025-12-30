import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import './Auth.css'; // Reusing auth styles for form consistency

const DataEntryPage = () => {
    const { addRevenueData, addExpenseData, addTrendData } = useData();

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

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        // Pass month AND description
        addExpenseData(expenseMonth, expenseDescription, expenseAmount);
        setExpenseDescription('');
        setExpenseMonth('');
        setExpenseAmount('');
        alert('Expense added!');
    };

    const handleRevenueSubmit = (e) => {
        e.preventDefault();
        // Pass 0 for expense since we removed the field
        addRevenueData(revenueMonth, revenueIncome, 0);
        setRevenueMonth('');
        setRevenueIncome('');
        alert('Revenue data added!');
    };

    const handleSavingsSubmit = (e) => {
        e.preventDefault();
        addTrendData(savingsMonth, savingsAmount);
        setSavingsMonth('');
        setSavingsAmount('');
        alert('Savings data added!');
    };

    return (
        <div className="auth-container" style={{ flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
            <h1 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Data Entry</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1200px' }}>
                {/* Expense Form */}
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Add Expense</h2>
                    </div>
                    <form className="auth-form" onSubmit={handleExpenseSubmit}>
                        <div className="form-group">
                            <label>Description</label>
                            <input
                                type="text"
                                placeholder="e.g. Groceries"
                                value={expenseDescription}
                                onChange={(e) => setExpenseDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Month (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Aug (Default: Current)"
                                value={expenseMonth}
                                onChange={(e) => setExpenseMonth(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                placeholder="e.g. 100"
                                value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button">Add Expense</button>
                    </form>
                </div>

                {/* Revenue Form */}
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Add Revenue</h2>
                    </div>
                    <form className="auth-form" onSubmit={handleRevenueSubmit}>
                        <div className="form-group">
                            <label>Month</label>
                            <input
                                type="text"
                                placeholder="e.g. Aug"
                                value={revenueMonth}
                                onChange={(e) => setRevenueMonth(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Income</label>
                            <input
                                type="number"
                                placeholder="e.g. 5000"
                                value={revenueIncome}
                                onChange={(e) => setRevenueIncome(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button">Add Revenue</button>
                    </form>
                </div>

                {/* Savings Form */}
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Add Savings</h2>
                    </div>
                    <form className="auth-form" onSubmit={handleSavingsSubmit}>
                        <div className="form-group">
                            <label>Month</label>
                            <input
                                type="text"
                                placeholder="e.g. Aug"
                                value={savingsMonth}
                                onChange={(e) => setSavingsMonth(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Savings Amount</label>
                            <input
                                type="number"
                                placeholder="e.g. 2000"
                                value={savingsAmount}
                                onChange={(e) => setSavingsAmount(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button">Add Savings</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DataEntryPage;
