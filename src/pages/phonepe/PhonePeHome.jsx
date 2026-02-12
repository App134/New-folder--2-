import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, User, Smartphone, Building2, Wallet, Send, Lightbulb, Zap, Tv, Receipt, X, Loader2, ArrowUpRight, ArrowDownLeft, TrendingUp, ShieldCheck, History, CreditCard, Banknote, Landmark } from 'lucide-react';
import { useData } from '../../context/DataContext';

const PhonePeHome = () => {
    const { addExpenseData, currency, allTransactions } = useData();
    const [showScanner, setShowScanner] = useState(false);
    const [activeFeature, setActiveFeature] = useState(null); // 'Send Money', 'Mobile', etc.
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [balance, setBalance] = useState(null);
    const [balanceLoading, setBalanceLoading] = useState(false);

    // Filter relevant transactions
    const recentTransactions = allTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);

    const handleTransaction = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!amount || amount <= 0) return;
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Determine Transaction Type
            let type = 'Expense'; // Default to Expense (Send Money, Pay Bills, etc.)

            if (activeFeature === 'Receive Money') {
                type = 'credit'; // Income
            } else if (activeFeature === 'Buy Gold' || activeFeature === 'Investments' || activeFeature?.includes('SIP')) {
                type = 'Saving'; // Investments/Gold
            }

            // Determine Success Message
            let successMessage = 'Payment Successful!';
            if (type === 'credit') successMessage = 'Money Received!';
            if (type === 'Saving') successMessage = 'Investment Successful!';

            await addExpenseData(
                new Date().toLocaleString('default', { month: 'short' }),
                activeFeature || 'Transaction',
                parseFloat(amount),
                new Date().toISOString(),
                'PhonePe Wallet',
                '', // Source (empty)
                type // Type (credit/expense/Saving)
            );

            setSuccessMsg(successMessage);
            setTimeout(() => {
                setSuccessMsg('');
                setActiveFeature(null);
                setAmount('');
            }, 2000);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const checkBalance = () => {
        if (balance !== null) {
            setBalance(null);
            return;
        }
        setBalanceLoading(true);
        setTimeout(() => {
            setBalance(124500);
            setBalanceLoading(false);
        }, 1500);
    };

    const openFeature = (featureName) => {
        setActiveFeature(featureName);
        setAmount('');
        setSuccessMsg('');
    };

    return (
        <div className="bg-background min-h-screen pt-6 pb-24 px-0 space-y-8 font-sans text-primary">

            {/* Dashboard Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">

                {/* Left Column (Main Actions) */}
                <div className="lg:col-span-8 space-y-6 lg:space-y-8">

                    {/* 1. Balance Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 relative overflow-hidden shadow-neon border border-white/10 group min-h-[200px] lg:h-64 flex flex-col justify-center bg-gradient-electric"
                    >
                        <div className="relative z-10 flex justify-between items-start lg:items-center">
                            <div>
                                <p className="text-white/80 text-xs lg:text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full ${balance !== null ? 'bg-success shadow-[0_0_8px_var(--success)]' : 'bg-slate-400'}`}></span>
                                    Total Balance
                                </p>
                                <h2 className="text-4xl lg:text-5xl font-bold flex items-center gap-3 lg:gap-4 tracking-tight text-white drop-shadow-md">
                                    {balance !== null ? (
                                        <span>{currency} {balance.toLocaleString()}</span>
                                    ) : (
                                        <span className="tracking-widest opacity-50 text-3xl lg:text-5xl">••••••</span>
                                    )}
                                    <button
                                        onClick={checkBalance}
                                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all backdrop-blur-sm"
                                    >
                                        {balanceLoading ? <Loader2 size={16} className="animate-spin text-white" /> : (balance !== null ? <X size={16} /> : <Wallet size={16} />)}
                                    </button>
                                </h2>
                            </div>
                            <div className="p-3 lg:p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/2560px-UPI-Logo-vector.svg.png" alt="UPI" className="h-6 lg:h-8 opacity-90 filter brightness-0 invert" />
                            </div>
                        </div>

                        {/* Animated Background Shapes */}
                        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 lg:w-96 lg:h-96 bg-accent/30 rounded-full blur-[60px] lg:blur-[80px] pointer-events-none animate-pulse-slow"></div>
                        <div className="absolute bottom-[-50%] left-[-10%] w-64 h-64 lg:w-96 lg:h-96 bg-primary/30 rounded-full blur-[60px] lg:blur-[80px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                    </motion.div>

                    {/* 2. Quick Actions */}
                    <div>
                        <div className="flex justify-between items-end mb-4 px-1">
                            <h3 className="text-muted font-bold text-xs lg:text-sm uppercase tracking-widest">Quick Actions</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                            <ActionCard
                                icon={Send}
                                label="Send Money"
                                subLabel="To Mobile / Bank"
                                color="shadow-[0_0_15px_-5px_var(--danger)] border-danger/20 hover:border-danger/50"
                                iconColor="text-danger"
                                onClick={() => openFeature('Send Money')}
                                delay={0.1}
                            />
                            <ActionCard
                                icon={ArrowDownLeft}
                                label="Receive Money"
                                subLabel="Via UPI ID / QR"
                                color="shadow-[0_0_15px_-5px_var(--success)] border-success/20 hover:border-success/50"
                                iconColor="text-success"
                                onClick={() => openFeature('Receive Money')}
                                delay={0.15}
                            />
                            <ActionCard
                                icon={TrendingUp}
                                label="Buy Gold"
                                subLabel="24K Pure Gold"
                                color="shadow-[0_0_15px_-5px_var(--warning)] border-warning/20 hover:border-warning/50"
                                iconColor="text-warning"
                                onClick={() => openFeature('Buy Gold')}
                                delay={0.2}
                            />
                            <ActionCard
                                icon={ShieldCheck}
                                label="Investments"
                                subLabel="SIPs & Mutual Funds"
                                color="shadow-[0_0_15px_-5px_var(--info)] border-info/20 hover:border-info/50"
                                iconColor="text-info"
                                onClick={() => openFeature('Investments')}
                                delay={0.25}
                            />
                        </div>
                    </div>

                    {/* 3. Recharge & Pay Bills */}
                    <div>
                        <h3 className="text-muted font-bold mb-4 text-xs lg:text-sm uppercase tracking-widest pl-1 mt-8">Recharge & Pay Bills</h3>
                        <div className="glass-panel p-6 rounded-[24px] lg:rounded-[32px] shadow-lg">
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-y-6 gap-x-2">
                                <ServiceItem icon={Smartphone} label="Mobile" onClick={() => openFeature('Mobile Recharge')} />
                                <ServiceItem icon={Tv} label="DTH" onClick={() => openFeature('DTH Recharge')} />
                                <ServiceItem icon={Zap} label="Electric" onClick={() => openFeature('Electricity Bill')} />
                                <ServiceItem icon={Receipt} label="Credit" onClick={() => openFeature('Credit Card Bill')} />
                                <ServiceItem icon={Building2} label="Rent" onClick={() => openFeature('Rent Payment')} />
                                <ServiceItem icon={Wallet} label="Loan" onClick={() => openFeature('Loan Repayment')} />
                                <ServiceItem icon={Lightbulb} label="Gas" onClick={() => openFeature('Gas Bill')} />
                                <ServiceItem icon={User} label="More" onClick={() => openFeature('More Services')} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Transactions & Tools) */}
                <div className="lg:col-span-4 space-y-6 lg:space-y-8">

                    {/* Scanner Widget */}
                    <motion.div
                        whileHover={{ y: -2 }}
                        onClick={() => setShowScanner(true)}
                        className="glass-panel p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] cursor-pointer group relative overflow-hidden flex flex-col items-center text-center gap-5 glass-card-hover"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-neon group-hover:scale-105 transition-transform duration-300">
                            <QrCode size={36} />
                        </div>
                        <div>
                            <h3 className="text-primary font-bold text-xl mb-1 group-hover:text-white transition-colors">Scan & Pay</h3>
                            <p className="text-muted text-sm">Scan any UPI QR Code</p>
                        </div>
                        {/* Beam Animation */}
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-primary shadow-neon animate-[scan_3s_ease-in-out_infinite] opacity-60"></div>
                    </motion.div>

                    {/* Recent Transactions List */}
                    <div className="glass-panel p-6 rounded-[24px] lg:rounded-[32px] flex flex-col shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-primary font-bold text-lg">Recent Activity</h3>
                            <button className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                                <History size={18} className="text-muted hover:text-white transition-colors" />
                            </button>
                        </div>

                        <div className="space-y-3 flex-1">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((t, idx) => (
                                    <TransactionCard key={t.id || idx} t={t} idx={idx} currency={currency} />
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted/50">
                                    <History size={40} className="mx-auto mb-4" />
                                    <p className="text-sm font-medium">No recent transactions</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full mt-6 py-3.5 rounded-xl bg-background-secondary hover:bg-white/5 text-secondary text-sm font-bold transition-all border border-transparent hover:border-secondary/20">
                            View Full History
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Scan Button (Mobile Only) */}
            <div className="fixed bottom-24 right-6 z-50 lg:hidden">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowScanner(true)}
                    className="bg-gradient-electric w-14 h-14 rounded-[20px] flex items-center justify-center text-white shadow-neon border border-white/20 hover:scale-105 transition-transform group"
                >
                    <QrCode size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </motion.button>
            </div>

            {/* QR Scanner Overlay */}
            <AnimatePresence>
                {showScanner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md text-white flex flex-col"
                    >
                        <div className="p-6 flex justify-between items-center z-10">
                            <h2 className="text-lg font-bold tracking-widest text-primary">SCAN QR CODE</h2>
                            <button onClick={() => setShowScanner(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        {/* Mock Camera View */}
                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            <div className="relative z-10 w-72 h-72 border-2 border-primary/30 rounded-[30px] flex items-center justify-center overflow-hidden shadow-neon">
                                <div className="absolute inset-0 border-[4px] border-transparent border-t-primary border-l-primary rounded-tl-[30px]"></div>
                                <div className="absolute inset-0 border-[4px] border-transparent border-t-primary border-r-primary rounded-tr-[30px]"></div>
                                <div className="absolute inset-0 border-[4px] border-transparent border-b-primary border-l-primary rounded-bl-[30px]"></div>
                                <div className="absolute inset-0 border-[4px] border-transparent border-b-primary border-r-primary rounded-br-[30px]"></div>

                                <div className="w-full h-full opacity-30 bg-center bg-no-repeat bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')" }}></div>

                                <motion.div
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-neon"
                                />
                            </div>
                            <p className="mt-8 text-xs text-primary font-medium tracking-wide bg-background-card px-4 py-2 rounded-full border border-primary/20 backdrop-blur-md">Align QR Code within the frame</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dynamic Feature Modal */}
            <AnimatePresence>
                {activeFeature && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4">
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-background-secondary w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 border-t sm:border border-white/10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-700/50 rounded-full sm:hidden"></div>

                            <div className="flex justify-between items-center mb-8 mt-4 sm:mt-0">
                                <h3 className="text-xl font-bold text-primary">{activeFeature}</h3>
                                <button onClick={() => setActiveFeature(null)} className="p-2 hover:bg-white/10 rounded-full text-muted transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {successMsg ? (
                                <div className="text-center py-10">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-success/30"
                                    >
                                        <Send className="text-white" size={40} />
                                    </motion.div>
                                    <h4 className="text-2xl font-bold text-white mb-2">{successMsg}</h4>
                                    <p className="text-muted font-mono text-sm">Txn ID: #PH{Math.floor(Math.random() * 1000000)}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleTransaction} className="space-y-6">
                                    <div className="flex flex-col items-center py-4">

                                        {/* Dynamic Recipient/Context Info */}
                                        <div className="flex items-center gap-3 mb-8 bg-background-card px-4 py-2 rounded-full border border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                                                {activeFeature === 'Send Money' ? 'JD' : <Wallet size={14} />}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-white font-bold text-sm">
                                                    {activeFeature === 'Send Money' ? 'John Doe' : activeFeature}
                                                </h4>
                                                <p className="text-muted text-[10px]">
                                                    {activeFeature === 'Send Money' ? '+91 98765 43210' : 'Bill Payment'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="relative w-full">
                                            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-8 text-4xl font-bold text-primary z-0 opacity-0">₹</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full text-center text-6xl font-bold text-white focus:outline-none bg-transparent placeholder-white/10 py-4"
                                                placeholder="₹0"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-background-card p-4 rounded-2xl flex items-center gap-4 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/1200px-SBI-logo.svg.png" alt="Bank" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white">State Bank of India</p>
                                            <p className="text-[10px] text-muted font-medium">**** 8901 • Savings</p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-electric hover:shadow-neon text-white font-bold py-4 rounded-2xl transition-all transform active:scale-95 disabled:opacity-70 text-lg"
                                    >
                                        {loading ? <Loader2 className="animate-spin mx-auto" /> : `Pay ₹${amount || '0'}`}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub Components ---

const ActionCard = ({ icon: Icon, label, subLabel, color, iconColor, onClick, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay, duration: 0.4 }}
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`glass-panel p-4 rounded-[24px] cursor-pointer h-36 relative overflow-hidden group glass-card-hover ${color} border`}
    >
        <div className="p-3 bg-white/5 w-fit rounded-2xl backdrop-blur-sm group-hover:bg-white/10 transition-colors">
            <Icon size={24} className={iconColor} />
        </div>
        <div className="mt-auto pt-4 relative z-10">
            <span className="font-bold text-sm text-primary-foreground block mb-0.5 group-hover:text-primary transition-colors">{label}</span>
            <span className="text-[10px] text-muted font-medium tracking-wide">{subLabel}</span>
        </div>

        {/* Hover Glow */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500"></div>
    </motion.div>
);

const ServiceItem = ({ icon: Icon, label, onClick }) => (
    <motion.div
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex flex-col items-center gap-2 cursor-pointer group fade-in-up"
    >
        <div className="w-12 h-12 rounded-2xl bg-background-card flex items-center justify-center border border-white/5 group-hover:border-primary/50 group-hover:shadow-neon transition-all">
            <Icon size={20} className="text-muted group-hover:text-primary transition-colors" />
        </div>
        <span className="text-[10px] text-muted font-medium group-hover:text-primary transition-colors">{label}</span>
    </motion.div>
);

const TransactionCard = ({ t, idx, currency }) => {
    // Determine Color & Icon based on Type/Category
    let iconBg = 'bg-background-secondary text-muted';
    let amountColor = 'text-primary-foreground';
    let Icon = ArrowDownLeft;
    let sign = '-';

    if (t.type === 'credit') {
        iconBg = 'bg-success/10 text-success';
        amountColor = 'text-success';
        Icon = ArrowDownLeft;
        sign = '+';
    } else {
        // Debit
        Icon = ArrowUpRight;
        if (t.category === 'Gold') {
            iconBg = 'bg-warning/10 text-warning';
            amountColor = 'text-primary-foreground';
        } else if (t.category === 'Mutual Fund' || t.category === 'Invest') {
            iconBg = 'bg-info/10 text-info';
            amountColor = 'text-primary-foreground';
        } else {
            iconBg = 'bg-danger/10 text-danger';
            amountColor = 'text-primary-foreground';
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 + 0.3 }}
            className="glass-panel p-4 rounded-[20px] flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg} backdrop-blur-sm shadow-sm`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="text-primary-foreground font-bold text-sm group-hover:text-primary transition-colors">{t.description}</h4>
                    <p className="text-muted text-[10px] font-medium mt-0.5">{new Date(t.date).toLocaleDateString()} • {t.category}</p>
                </div>
            </div>
            <div className={`font-bold text-sm ${amountColor}`}>
                {sign} {currency}{t.amount.toLocaleString()}
            </div>
        </motion.div>
    );
};

export default PhonePeHome;
