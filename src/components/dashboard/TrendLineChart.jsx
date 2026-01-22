import React, { useRef, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useData } from '../../context/DataContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const TrendLineChart = () => {
    const { trendData } = useData();
    const chartRef = useRef(null);

    // Memoize the chart data to prevent unnecessary re-renders/calculations
    const chartData = useMemo(() => {
        // Create canvas context for gradient if ref exists
        let gradientFill = null;
        if (chartRef.current) {
            const ctx = chartRef.current.ctx;
            gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
            gradientFill.addColorStop(0, 'rgba(16, 185, 129, 0.3)'); // #10b981 with opacity
            gradientFill.addColorStop(1, 'rgba(16, 185, 129, 0)');
        }

        return {
            labels: trendData.map(item => item.name),
            datasets: [
                {
                    label: 'Savings',
                    data: trendData.map(item => item.savings),
                    fill: true,
                    backgroundColor: gradientFill || 'rgba(16, 185, 129, 0.1)',
                    borderColor: '#10b981',
                    borderWidth: 3,
                    tension: 0.4, // monotone/smooth curve
                    pointRadius: 0,
                    pointHoverRadius: 4,
                },
            ],
        };
    }, [trendData]);

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

    // Force update when chartRef is ready to apply gradient (trickier in functional component without callback, but let's try a simple approach or fallback)
    // Actually, react-chartjs-2 might handle this best by creating gradient in a useEffect or using a helper.
    // However, since we can't easily get the canvas context *before* render for the data object prop, 
    // a common pattern is to use a "Scriptable" option or just a solid color fallback until ref is ready.
    // For simplicity and stability, let's use a solid color fallback in useMemo and effect to update if needed, 
    // or just rely on a function for backgroundColor if Chart.js supports it (it does for some properties).

    // Better approach for gradient in React:
    const data = {
        labels: trendData.map(item => item.name),
        datasets: [
            {
                label: 'Savings',
                data: trendData.map(item => item.savings),
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                    return gradient;
                },
                borderColor: '#10b981',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
        ],
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <Line options={options} data={data} />
        </div>
    );
};

export default TrendLineChart;
