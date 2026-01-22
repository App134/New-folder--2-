import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useData } from '../../context/DataContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ExpensePieChart = () => {
    const { expenseData } = useData();

    const data = {
        labels: expenseData.map(item => item.name),
        datasets: [
            {
                data: expenseData.map(item => item.value),
                backgroundColor: COLORS,
                borderColor: 'transparent', // or use card background color if needed for separation
                borderWidth: 2,
                cutout: '75%', // Mimic innerRadius/outerRadius ratio
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#f8fafc',
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                },
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f8fafc',
                bodyColor: '#f8fafc',
                borderColor: '#334155',
                borderWidth: 1,
            },
        },
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <Doughnut data={data} options={options} />
        </div>
    );
};

export default ExpensePieChart;
