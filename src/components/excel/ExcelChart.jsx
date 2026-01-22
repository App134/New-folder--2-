import React, { useMemo } from 'react';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ExcelChart = ({ data: excelData, headers }) => {
    if (!excelData || excelData.length === 0 || headers.length < 2) {
        return null;
    }

    // Assume Col 0 = Label (XAxis), Col 1 = Value (Bar)
    const xKey = headers[0];
    const barKey = headers[1];

    // Memoize chart config
    const chartData = useMemo(() => {
        return {
            labels: excelData.map(item => item[xKey]),
            datasets: [
                {
                    label: barKey,
                    data: excelData.map(item => item[barKey]),
                    backgroundColor: '#8b5cf6',
                    borderRadius: 4,
                },
            ],
        };
    }, [excelData, xKey, barKey]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
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
        <div style={{ width: '100%', height: 300, marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Preview: {barKey} by {xKey}</h3>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default ExcelChart;
