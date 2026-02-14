import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SummaryCard from '../components/dashboard/SummaryCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import ExpenseBarChart from '../components/dashboard/ExpenseBarChart';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import BudgetCard from '../components/dashboard/BudgetCard';
import BillReminder from '../components/dashboard/BillReminder';
import FinanceAI from '../components/dashboard/FinanceAI';
import { DollarSign, CreditCard, PiggyBank, TrendingUp, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

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
    const { revenueData, trendData, currency, allTransactions, convertValue } = useData();
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
            className="p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 space-y-4 sm:space-y-6 lg:space-y-8 bg-background min-h-screen text-primary-foreground"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" variants={itemVariants}>
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-muted mt-1 text-sm sm:text-base">Welcome back, {userName}. Here's your financial overview.</p>
                </div>

            </motion.div>

            {/* Summary Cards */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6" variants={itemVariants}>
                <SummaryCard
                    title="Total Income"
                    amount={`${currency}${convertValue(totalIncome).toLocaleString()}`}
                    change={incomeTrend.change}
                    isPositive={incomeTrend.isPositive}
                    icon={DollarSign}
                    color="blue"
                />
                <SummaryCard
                    title="Total Expenses"
                    amount={`${currency}${convertValue(totalExpenses).toLocaleString()}`}
                    change={expenseTrend.change}
                    isPositive={expenseTrend.isPositive}
                    icon={CreditCard}
                    color="red"
                />
                <SummaryCard
                    title="Total Savings"
                    amount={`${currency}${convertValue(totalSavings).toLocaleString()}`}
                    change={savingsTrend.change}
                    isPositive={savingsTrend.isPositive}
                    icon={PiggyBank}
                    color="green"
                />
                <SummaryCard
                    title="Net Worth Trend"
                    amount={`${currency}${convertValue(totalIncome - totalExpenses).toLocaleString()}`}
                    change="Overall"
                    isPositive={true}
                    icon={TrendingUp}
                    color="purple"
                />
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 xl:gap-8">
                {/* Main Revenue Chart */}
                <motion.div className="lg:col-span-2 glass-panel p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-lg" variants={itemVariants}>
                    <div className="mb-4 sm:mb-6 text-base sm:text-lg font-bold text-white flex justify-between items-center">
                        <span>Revenue & Expenses</span>
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors touch-target">
                            <Calendar size={18} className="sm:w-5 sm:h-5" />
                        </button>
                    </div>
                    <RevenueChart />
                </motion.div>

                {/* Expense Breakdown */}
                <motion.div className="glass-panel p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-lg flex flex-col" variants={itemVariants}>
                    <div className="mb-4 sm:mb-6 text-base sm:text-lg font-bold text-white">Expense Distribution</div>
                    <ExpensePieChart />
                </motion.div>
            </div>

            {/* Secondary Charts & Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 xl:gap-8">
                <motion.div className="glass-panel p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-lg" variants={itemVariants}>
                    <div className="mb-4 sm:mb-6 text-base sm:text-lg font-bold text-white">Category Breakdown</div>
                    <ExpenseBarChart />
                </motion.div>

                <motion.div className="glass-panel p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-lg" variants={itemVariants}>
                    <div className="mb-4 sm:mb-6 text-base sm:text-lg font-bold text-white">Financial Growth</div>
                    <TrendLineChart />
                </motion.div>

                <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
                    <motion.div variants={itemVariants}>
                        <BillReminder />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <BudgetCard />
                    </motion.div>
                </div>
            </div>

            {/* Recent Transactions Section */}
            <motion.div className="glass-panel p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-lg col-span-12" variants={itemVariants}>
                <div className="mb-4 sm:mb-6 text-base sm:text-lg font-bold text-white flex flex-col sm:flex-row justify-between gap-2">
                    <span>Recent Transactions</span>
                    <span className="text-xs sm:text-sm text-muted">Last 5 entries</span>
                </div>
                <div className="w-full overflow-x-auto table-responsive">
                    <table className="w-full border-collapse text-xs sm:text-sm text-slate-200">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="p-2 sm:p-3 text-left text-muted font-medium whitespace-nowrap">Date</th>
                                <th className="p-2 sm:p-3 text-left text-muted font-medium whitespace-nowrap">Description</th>
                                <th className="p-2 sm:p-3 text-left text-muted font-medium whitespace-nowrap">Category</th>
                                <th className="p-2 sm:p-3 text-right text-muted font-medium whitespace-nowrap">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTransactions && allTransactions.slice(0, 5).map((txn, index) => (
                                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-2 sm:p-3 text-primary-foreground whitespace-nowrap text-xs sm:text-sm">{new Date(txn.date).toLocaleDateString()}</td>
                                    <td className="p-2 sm:p-3 text-primary-foreground font-medium text-xs sm:text-sm">{txn.description}</td>
                                    <td className="p-2 sm:p-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${txn.type === 'credit' ? 'bg-success/10 text-success' :
                                            (txn.type === 'Investment' || txn.type === 'Saving') ? 'bg-warning/10 text-warning' :
                                                'bg-danger/10 text-danger'
                                            }`}>
                                            {txn.category || (txn.type === 'credit' ? 'Income' : (txn.type === 'Investment' || txn.type === 'Saving') ? 'Saving' : 'Expense')}
                                        </span>
                                    </td>
                                    <td className={`p-2 sm:p-3 text-right font-bold whitespace-nowrap text-xs sm:text-sm ${txn.type === 'credit' ? 'text-success' :
                                        (txn.type === 'Investment' || txn.type === 'Saving') ? 'text-warning' :
                                            'text-primary-foreground'
                                        }`}>
                                        {txn.type === 'credit' ? '+' : '-'} {currency}{txn.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {(!allTransactions || allTransactions.length === 0) && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-muted">No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Finance AI Chatbot */}
            <FinanceAI />
        </motion.div>
    );
};

export default Dashboard;
