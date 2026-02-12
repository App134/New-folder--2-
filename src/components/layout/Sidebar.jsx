import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Settings, LogOut, PlusCircle, FileSpreadsheet, CreditCard } from 'lucide-react';


import { useAuth } from '../../context/AuthContext';

import logo from '../../assets/logo.png';

const Sidebar = ({ isOpen, onClose }) => {
    // Get user from Auth Context
    const { currentUser, userProfile, logout } = useAuth();
    const userName = userProfile?.username || currentUser?.displayName || currentUser?.email || 'User';
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleNavClick = () => {
        if (window.innerWidth <= 768 && onClose) {
            onClose();
        }
    };

    const NavItem = ({ to, icon: Icon, label }) => (
        <li>
            <Link
                to={to}
                onClick={handleNavClick}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive(to)
                    ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-neon'
                    : 'text-muted hover:bg-white/5 hover:text-primary-foreground'
                    }`}
            >
                <Icon size={20} />
                <span>{label}</span>
            </Link>
        </li>
    );

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={`w-[250px] min-h-screen bg-background-secondary border-r border-white/5 flex flex-col p-6 fixed left-0 top-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                <div className="flex items-center gap-4 mb-12">
                    <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-neon overflow-hidden">
                        <img src={logo} alt="Logo" className="w-full h-full object-cover mix-blend-screen" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">FinanceFlow</h1>
                </div>

                <nav className="flex-1">
                    <ul className="flex flex-col gap-2">
                        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                        <NavItem to="/data-entry" icon={PlusCircle} label="Data Entry" />
                        <NavItem to="/user" icon={Settings} label="Settings" />
                        <NavItem to="/transactions" icon={Wallet} label="Finance History" />
                        <NavItem to="/google-sheet" icon={FileSpreadsheet} label="Google Sheets" />
                    </ul>
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">

                    <button
                        className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-muted transition-all hover:bg-danger/10 hover:text-danger text-base group"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
