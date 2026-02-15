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
            className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="mb-6 sm:mb-8"
                variants={itemVariants}
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Google Sheets Integration</h2>
                <p className="text-sm sm:text-base text-muted">Sync your financial data directly from Google Sheets.</p>
            </motion.div>

            <motion.div
                className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6"
                variants={itemVariants}
            >
                <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">Sync Data</h3>
                <p className="text-sm text-muted mb-4">
                    Connect to your Google Sheet to import transactions or export your dashboard data.
                </p>
                <GoogleSheetSync />
            </motion.div>

            <motion.div
                className="bg-card border border-border rounded-xl p-4 sm:p-6"
                variants={itemVariants}
            >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-primary m-0">Monthly Summary</h3>
                    <span className="text-xs sm:text-sm text-muted">View your imported data aggregated by month</span>
                </div>
                <DataList />
            </motion.div>
        </motion.div>
    );
};

export default GoogleSheetPage;
