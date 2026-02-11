import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useData } from '../../context/DataContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ExpenseBarChart = () => {
    const { expenseData, theme } = useData();

    // Determine colors based on theme if needed, but let's stick to a vibrant palette
    // that contrasts well with dark mode (default) and light mode.

    // Check if expenseData is empty
    if (!expenseData || expenseData.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-secondary)' }}>
                No expense data available
            </div>
        );
    }

    const labels = expenseData.map(item => item.name);
    const dataValues = expenseData.map(item => item.value);

    const data = {
        labels,
        datasets: [
            {
                label: 'Expenses by Category',
                data: dataValues,
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue-500 equivalent
                borderColor: '#3b82f6',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: '#2563eb',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Hide legend for single dataset to save space
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f8fafc',
                bodyColor: '#f8fafc',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: 'var(--text-secondary)',
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: 'var(--text-secondary)',
                }
            }
        },
    };

    return (
        <div style={{ width: '100%', height: 300, padding: '10px' }}>
            <Bar options={options} data={data} />
        </div>
    );
};

export default ExpenseBarChart;
