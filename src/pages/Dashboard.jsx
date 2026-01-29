import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import SummaryCard from '../components/dashboard/SummaryCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import GoogleSheetSync from '../components/google/GoogleSheetSync';
import DataList from '../components/dashboard/DataList';
import { DollarSign, CreditCard, PiggyBank } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

const Dashboard = () => {
    const { revenueData, trendData, currency, allTransactions } = useData();
    const { currentUser, userProfile } = useAuth();

    const userName = userProfile?.username || currentUser?.displayName || 'User';

    const totalIncome = useMemo(() => revenueData.reduce((acc, curr) => acc + (curr.income || 0), 0), [revenueData]);
    const totalExpenses = useMemo(() => revenueData.reduce((acc, curr) => acc + (curr.expense || 0), 0), [revenueData]);
    const totalSavings = useMemo(() => trendData.reduce((acc, curr) => acc + (curr.savings || 0), 0), [trendData]);

    // Calculate Trends (MoM)
    const getTrend = (current, previous, isExpense = false) => {
        if (!previous || previous === 0) return { change: current > 0 ? '+100%' : '0%', isPositive: !isExpense };
        const diff = current - previous;
        const percent = ((diff / previous) * 100).toFixed(1);
        const sign = diff >= 0 ? '+' : '';
        // For Expenses: Income increase is BAD (Negative), Decrease is GOOD (Positive) logic? 
        // Standard: Increase is Red (negative impact), Decrease is Green (positive impact).
        // isPositive param determines Color. True = Green, False = Red.
        // For Expense: Increase (+X%) -> Bad (False). Decrease (-X%) -> Good (True).
        const positiveImpact = isExpense ? diff <= 0 : diff >= 0;
        return { change: `${sign}${percent}%`, isPositive: positiveImpact };
    };

    const incomeTrend = useMemo(() => {
        const curr = revenueData[0]?.income || 0;
        const prev = revenueData[1]?.income || 0;
        return getTrend(curr, prev);
    }, [revenueData]);

    const expenseTrend = useMemo(() => {
        const curr = revenueData[0]?.expense || 0;
        const prev = revenueData[1]?.expense || 0;
        return getTrend(curr, prev, true);
    }, [revenueData]);

    const savingsTrend = useMemo(() => {
        const curr = trendData[0]?.savings || 0;
        const prev = trendData[1]?.savings || 0;
        return getTrend(curr, prev);
    }, [trendData]);

    return (
        <motion.div
            className="dashboard-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="welcome-section" variants={itemVariants}>
                <h2>Welcome, {userName}</h2>
                <p>Overview of your financial status.</p>
            </motion.div>

            <motion.div className="stats-grid" variants={itemVariants}>
                <SummaryCard
                    title="Total Income"
                    amount={`${currency}${totalIncome.toLocaleString()}`}
                    change={incomeTrend.change}
                    isPositive={incomeTrend.isPositive}
                    icon={DollarSign}
                    color="blue"
                />
                <SummaryCard
                    title="Total Expenses"
                    amount={`${currency}${totalExpenses.toLocaleString()}`}
                    change={expenseTrend.change}
                    isPositive={expenseTrend.isPositive}
                    icon={CreditCard}
                    color="red"
                />
                <SummaryCard
                    title="Total Savings"
                    amount={`${currency}${totalSavings.toLocaleString()}`}
                    change={savingsTrend.change}
                    isPositive={savingsTrend.isPositive}
                    icon={PiggyBank}
                    color="green"
                />
            </motion.div>

            <div className="charts-grid">
                <motion.div className="chart-card large" variants={itemVariants}>
                    <h3>Revenue Overview</h3>
                    <RevenueChart />
                </motion.div>
                <motion.div className="chart-card medium" variants={itemVariants}>
                    <h3>Expense Breakdown</h3>
                    <ExpensePieChart />
                </motion.div>
                <motion.div className="chart-card full-width" variants={itemVariants}>
                    <h3>Financial Growth Trend</h3>
                    <TrendLineChart />
                </motion.div>

                <motion.div className="chart-card full-width" variants={itemVariants}>
                    {/* Recent Transactions */}
                    <div style={{ marginTop: '0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Recent Transactions</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Showing last 5</span>
                        </div>

                        <div style={{ width: '100%', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Category</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allTransactions && allTransactions.slice(0, 5).map((txn, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.75rem' }}>{new Date(txn.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '0.75rem' }}>{txn.description}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: txn.type === 'credit' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: txn.type === 'credit' ? 'var(--accent-success)' : 'var(--accent-danger)',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {txn.category || (txn.type === 'credit' ? 'Income' : 'Expense')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: txn.type === 'credit' ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                                                {currency}{txn.amount}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!allTransactions || allTransactions.length === 0) && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;

