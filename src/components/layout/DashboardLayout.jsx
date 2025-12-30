import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './DashboardLayout.css';
import Dashboard from '../../pages/Dashboard';

const DashboardLayout = () => {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <Header />
                <div className="content-area">
                    <Dashboard />
                </div>
            </main>
        </div>
    );
};

// HELLO WORLD;

export default DashboardLayout;
