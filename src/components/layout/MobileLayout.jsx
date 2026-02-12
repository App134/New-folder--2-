import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Activity, CreditCard, User, Wallet, Settings, LogOut, LayoutDashboard } from 'lucide-react';

const MobileLayout = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans text-slate-100 flex">
            {/* Desktop Sidebar (Visible on large screens) */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-[#0f172a] p-6 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
                        Pe
                    </div>
                    <div>
                        <h1 className="font-bold text-xl text-white tracking-wide">PhonePe Pro</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Business Dashboard</p>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavItem to="/phonepe" icon={Home} label="Dashboard" active={isActive('/phonepe')} desktop />
                    <NavItem to="/phonepe/wealth" icon={CreditCard} label="Wealth & Investment" active={isActive('/phonepe/wealth')} desktop />
                    <NavItem to="/phonepe/history" icon={Activity} label="Transaction History" active={isActive('/phonepe/history')} desktop />
                    <div className="pt-6 pb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4">Account</p>
                    </div>
                    <NavItem to="/user" icon={User} label="Profile & Settings" active={isActive('/user')} desktop />
                    <NavItem to="/" icon={LayoutDashboard} label="Switch to Main App" active={false} desktop />
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors px-4 py-2 w-full">
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 w-full relative z-0">
                {/* Background Gradients */}
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]"></div>
                </div>

                {/* Desktop Header */}
                <header className="hidden lg:flex justify-between items-center p-6 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
                    <h2 className="text-2xl font-bold text-white">
                        {isActive('/phonepe') ? 'Overview' :
                            isActive('/phonepe/wealth') ? 'Wealth' :
                                isActive('/phonepe/history') ? 'History' : 'Account'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-white">John Doe</p>
                            <p className="text-xs text-slate-400">+91 98765 43210</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10 shadow-inner">
                            <User size={20} className="text-slate-300" />
                        </div>
                    </div>
                </header>

                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>

            {/* Mobile Bottom Navigation (Visible on small screens only) */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/5 z-50 pb-[env(safe-area-inset-bottom,20px)]">
                <div className="flex justify-around items-center py-3">
                    <NavItem to="/phonepe" icon={Home} label="Home" active={isActive('/phonepe')} />
                    <NavItem to="/phonepe/wealth" icon={CreditCard} label="Money" active={isActive('/phonepe/wealth')} />
                    <NavItem to="/phonepe/history" icon={Activity} label="History" active={isActive('/phonepe/history')} />
                    <NavItem to="/user" icon={User} label="Profile" active={isActive('/user')} />
                </div>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon: Icon, label, active, desktop }) => (
    <Link
        to={to}
        className={desktop
            ? `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-purple-600/10 text-purple-400 border border-purple-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`
            : `flex flex-col items-center gap-1 min-w-[64px] group`
        }
    >
        {desktop ? (
            <>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className={`font-medium text-sm ${active ? 'text-purple-400' : ''}`}>{label}</span>
            </>
        ) : (
            <>
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-purple-500/20 text-purple-400 transform -translate-y-1' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${active ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {label}
                </span>
            </>
        )}
    </Link>
);

export default MobileLayout;
