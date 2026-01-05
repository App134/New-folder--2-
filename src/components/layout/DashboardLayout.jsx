import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './DashboardLayout.css';
import Dashboard from '../../pages/Dashboard';
import Footer from './Footer';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            <main className="main-content">
                <Header onMenuClick={toggleSidebar} />
                <div className="content-area">
                    <Dashboard />
                </div>
                <Footer />
                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="sidebar-overlay"
                        onClick={closeSidebar}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 90,
                            backdropFilter: 'blur(2px)'
                        }}
                    />
                )}
            </main>
        </div>
    );
};

// HELLO WORLD;

export default DashboardLayout;
