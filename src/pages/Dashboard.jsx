import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import SummaryCard from '../components/dashboard/SummaryCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import ExpenseBarChart from '../components/dashboard/ExpenseBarChart';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import BudgetCard from '../components/dashboard/BudgetCard';
import SavingsGoals from '../components/dashboard/SavingsGoals';
import BillReminder from '../components/dashboard/BillReminder';

import FinanceAI from '../components/dashboard/FinanceAI';

import { DollarSign, CreditCard, PiggyBank, TrendingUp } from 'lucide-react';
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
    const { revenueData, trendData, currency, allTransactions, creditCardPayable } = useData();
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
            <motion.div className="dashboard-header" variants={itemVariants}>
                <div className="welcome-text">
                    <h1>Welcome back, {userName}</h1>
                    <p>Here's your financial overview for today.</p>
                </div>
            </motion.div>



            <div className="dashboard-grid">
                {/* Summary Cards Row */}
                <motion.div className="summary-cards-section" variants={itemVariants}>
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
                    <SummaryCard
                        title="Net Worth Trend"
                        amount={`${currency}${(totalIncome - totalExpenses).toLocaleString()}`}
                        change="Overall"
                        isPositive={true}
                        icon={TrendingUp}
                        color="purple"
                    />
                </motion.div>

                {/* Main Charts Section */}
                <div className="main-charts-section">
                    <motion.div className="chart-card" variants={itemVariants}>
                        <div className="chart-header">Revenue & Expenses</div>
                        <RevenueChart />
                    </motion.div>

                    <motion.div className="chart-card" variants={itemVariants}>
                        <div className="chart-header">Category Breakdown (Bar)</div>
                        <ExpenseBarChart />
                    </motion.div>

                    <motion.div className="chart-card" variants={itemVariants}>
                        <div className="chart-header">Financial Growth</div>
                        <TrendLineChart />
                    </motion.div>
                </div>

                {/* Side Panel Section */}
                <div className="side-panel-section">
                    <motion.div variants={itemVariants}>
                        <BillReminder />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <BudgetCard />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <SavingsGoals />
                    </motion.div>

                    <motion.div className="chart-card" variants={itemVariants}>
                        <div className="chart-header">Expense Distribution (Pie)</div>
                        <ExpensePieChart />
                    </motion.div>
                </div>

                {/* Recent Transactions Section */}
                <motion.div className="chart-card transactions-section" variants={itemVariants}>
                    <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Recent Transactions</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last 5 entries</span>
                    </div>
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Date</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Description</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Category</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allTransactions && allTransactions.slice(0, 5).map((txn, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.75rem' }}>{new Date(txn.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '0.75rem' }}>{txn.description}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                background: txn.type === 'credit' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: txn.type === 'credit' ? '#10b981' : '#ef4444',
                                                fontSize: '0.8rem'
                                            }}>
                                                {txn.category || (txn.type === 'credit' ? 'Income' : 'Expense')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500', color: txn.type === 'credit' ? '#10b981' : 'var(--text-primary)' }}>
                                            {currency}{txn.amount.toLocaleString()}
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
                </motion.div>
            </div>
            {/* Finance AI Chatbot */}
            <FinanceAI />
        </motion.div>
    );
};

export default Dashboard;
