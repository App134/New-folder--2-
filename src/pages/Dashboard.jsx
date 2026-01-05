import React from 'react';
import SummaryCard from '../components/dashboard/SummaryCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import GoogleSheetSync from '../components/google/GoogleSheetSync';
import DataList from '../components/dashboard/DataList';
import ExcelChart from '../components/excel/ExcelChart'; // Keeping ExcelChart for visualization for now
import { useState, useMemo } from 'react';
import { DollarSign, CreditCard, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import './Dashboard.css';

const Dashboard = () => {
    const { revenueData, trendData, currency } = useData();
    const [excelData, setExcelData] = useState([]);
    const [excelHeaders, setExcelHeaders] = useState([]);

    const totalIncome = useMemo(() => revenueData.reduce((acc, curr) => acc + (curr.income || 0), 0), [revenueData]);
    const totalExpenses = useMemo(() => revenueData.reduce((acc, curr) => acc + (curr.expense || 0), 0), [revenueData]);
    const totalSavings = useMemo(() => trendData.reduce((acc, curr) => acc + (curr.savings || 0), 0), [trendData]);

    const handleExcelData = (data, headers) => {
        setExcelData(data);
        setExcelHeaders(headers);
    };

    return (
        <div className="dashboard-container">
            <div className="welcome-section">
                <h2>Dashboard</h2>
                <p>Overview of your financial status.</p>
            </div>

            <div className="stats-grid">
                <SummaryCard
                    title="Total Income"
                    amount={`${currency}${totalIncome.toLocaleString()}`}
                    change="+0%"
                    isPositive={true}
                    icon={DollarSign}
                    color="blue"
                />
                <SummaryCard
                    title="Total Expenses"
                    amount={`${currency}${totalExpenses.toLocaleString()}`}
                    change="-0%"
                    isPositive={true}
                    icon={CreditCard}
                    color="red"
                />
                <SummaryCard
                    title="Total Savings"
                    amount={`${currency}${totalSavings.toLocaleString()}`}
                    change="+0%"
                    isPositive={true}
                    icon={PiggyBank}
                    color="green"
                />
            </div>

            <div className="charts-grid">
                <div className="chart-card large">
                    <h3>Revenue Overview</h3>
                    <RevenueChart />
                </div>
                <div className="chart-card medium">
                    <h3>Expense Breakdown</h3>
                    <ExpensePieChart />
                </div>
                <div className="chart-card full-width">
                    <h3>Financial Growth Trend</h3>
                    <TrendLineChart />
                </div>

                <div className="chart-card full-width">
                    <h3>Google Sheets Integration</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Sync data from Google Sheets directly to your local database.
                    </p>
                    <GoogleSheetSync onDataSynced={handleExcelData} />

                    <div style={{ marginTop: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Database Records</h4>
                        <DataList />
                    </div>


                    {excelData.length > 0 && (
                        <div style={{ marginTop: '2rem', overflowX: 'auto' }}>
                            <h4>Synced Data Preview (Session Only)</h4>
                            <ExcelChart data={excelData} headers={excelHeaders} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

