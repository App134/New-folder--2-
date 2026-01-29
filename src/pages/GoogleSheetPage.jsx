import React from 'react';
import { motion } from 'framer-motion';
import GoogleSheetSync from '../components/google/GoogleSheetSync';
import DataList from '../components/dashboard/DataList';

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

const GoogleSheetPage = () => {
    return (
        <motion.div
            className="dashboard-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ padding: '2rem' }}
        >
            <motion.div className="welcome-section" variants={itemVariants} style={{ marginBottom: '2rem' }}>
                <h2>Google Sheets Integration</h2>
                <p>Sync your financial data directly from Google Sheets.</p>
            </motion.div>

            <motion.div className="chart-card full-width" variants={itemVariants}>
                <h3>Sync Data</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Connect to your Google Sheet to import transactions or export your dashboard data.
                </p>
                <GoogleSheetSync />
            </motion.div>

            <motion.div className="chart-card full-width" variants={itemVariants} style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Monthly Summary</h3>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>View your imported data aggregated by month</span>
                </div>
                <DataList />
            </motion.div>
        </motion.div>
    );
};

export default GoogleSheetPage;
