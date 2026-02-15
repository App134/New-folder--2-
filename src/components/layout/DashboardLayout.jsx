import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './DashboardLayout.css';
import Dashboard from '../../pages/Dashboard';
import Footer from './Footer';

const DashboardLayout = ({ children }) => {
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
                    {children ? children : <Dashboard />}
                </div>
                <Footer />
            </main>
        </div>
    );
};

export default DashboardLayout;
