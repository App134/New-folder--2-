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

const RevenueChart = () => {
    const { revenueData } = useData();

    const data = {
        labels: revenueData.map(item => item.name),
        datasets: [
            {
                label: 'Income',
                data: revenueData.map(item => item.income),
                backgroundColor: '#3b82f6',
                borderRadius: 4,
            },
            {
                label: 'Expense',
                data: revenueData.map(item => item.expense),
                backgroundColor: '#ef4444',
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Recharts version didn't have a visible legend in the snippet, but let's check if we want it. The snippet didn't show <Legend />.
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f8fafc',
                bodyColor: '#f8fafc',
                borderColor: '#334155',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#94a3b8',
                },
                border: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: 'rgba(51, 65, 85, 0.5)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                },
                border: {
                    display: false
                }
            },
        },
    };

    return (
        <div style={{ width: '100%', height: '250px', minHeight: '200px' }} className="sm:h-[280px] md:h-[300px]">
            <Bar options={options} data={data} />
        </div>
    );
};

export default RevenueChart;
