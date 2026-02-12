import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Coins, PiggyBank, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

const PhonePeWealth = () => {
    const { addExpenseData } = useData();
    const [buyModal, setBuyModal] = useState(null); // 'gold' | 'sip'
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInvest = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!amount || amount <= 0) return;
            const category = buyModal === 'gold' ? 'Gold' : 'Mutual Fund';
            await addExpenseData(
                new Date().toLocaleString('default', { month: 'short' }),
                category,
                parseFloat(amount),
                new Date().toISOString(),
                'PhonePe Wealth',
                'Investment'
            );
            // alert(`Invested ₹${amount} in ${category} successfully!`); // Replaced with safer logic or toast if available
            setBuyModal(null);
            setAmount('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-screen pb-24 font-sans text-primary">
            {/* Header */}
            <div className="bg-background-secondary p-6 pb-12 rounded-b-[32px] shadow-neon relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-1 text-white">Wealth Management</h1>
                    <p className="text-muted text-sm">Grow your money with Gold & SIPs</p>
                </div>
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
            </div>

            {/* Portfolio Card */}
            <div className="mx-6 -mt-8 glass-panel p-6 rounded-[24px] shadow-lg relative z-20">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Total Wealth</p>
                        <h2 className="text-3xl font-bold text-white tracking-tight">₹45,200</h2>
                    </div>
                    <div className="bg-success/10 text-success border border-success/20 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_10px_-4px_var(--success)]">
                        +12.5%
                    </div>
                </div>
                {/* Visual Bar */}
                <div className="h-3 bg-white/5 rounded-full overflow-hidden flex mb-4">
                    <div className="w-[60%] bg-warning shadow-[0_0_10px_var(--warning)]"></div>
                    <div className="w-[40%] bg-info shadow-[0_0_10px_var(--info)]"></div>
                </div>
                <div className="flex justify-between text-xs font-medium">
                    <div className="flex items-center gap-2 text-white">
                        <div className="w-2.5 h-2.5 rounded-full bg-warning shadow-[0_0_5px_var(--warning)]"></div> Gold (60%)
                    </div>
                    <div className="flex items-center gap-2 text-white">
                        <div className="w-2.5 h-2.5 rounded-full bg-info shadow-[0_0_5px_var(--info)]"></div> Funds (40%)
                    </div>
                </div>
            </div>

            {/* Investment Options */}
            <div className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-primary uppercase tracking-widest text-xs mb-2">Investment Ideas</h3>

                {/* Gold */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setBuyModal('gold')}
                    className="glass-panel p-4 rounded-[24px] flex items-center justify-between cursor-pointer glass-card-hover group border border-white/5"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-warning/10 rounded-2xl flex items-center justify-center text-warning border border-warning/20 shadow-[0_0_15px_-5px_var(--warning)]">
                            <Coins size={28} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg group-hover:text-warning transition-colors">24K Digital Gold</h4>
                            <p className="text-xs text-muted font-medium mt-0.5">99.99% Pure • Start at ₹1</p>
                        </div>
                    </div>
                    <ArrowRight size={20} className="text-muted group-hover:text-warning transition-colors" />
                </motion.div>

                {/* SIP */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setBuyModal('sip')}
                    className="glass-panel p-4 rounded-[24px] flex items-center justify-between cursor-pointer glass-card-hover group border border-white/5"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-info/10 rounded-2xl flex items-center justify-center text-info border border-info/20 shadow-[0_0_15px_-5px_var(--info)]">
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg group-hover:text-info transition-colors">Start a SIP</h4>
                            <p className="text-xs text-muted font-medium mt-0.5">Top Rated Funds • High Returns</p>
                        </div>
                    </div>
                    <ArrowRight size={20} className="text-muted group-hover:text-info transition-colors" />
                </motion.div>

                {/* Tax Saving */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass-panel p-4 rounded-[24px] flex items-center justify-between group border border-white/5"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary border border-secondary/20 shadow-[0_0_15px_-5px_var(--secondary)]">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg group-hover:text-secondary transition-colors">Tax Saving Funds</h4>
                            <p className="text-xs text-muted font-medium mt-0.5">Save up to ₹46,800/yr</p>
                        </div>
                    </div>
                    <ArrowRight size={20} className="text-muted group-hover:text-secondary transition-colors" />
                </motion.div>
            </div>

            {/* Buy Modal */}
            {buyModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end justify-center sm:items-center sm:p-4">
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        className="bg-background-secondary w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 pb-12 sm:pb-6 border-t sm:border border-white/10 shadow-2xl relative"
                    >
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-700/50 rounded-full sm:hidden"></div>

                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white">
                                {buyModal === 'gold' ? 'Buy 24K Gold' : 'Invest in Mutual Funds'}
                            </h3>
                            <button onClick={() => setBuyModal(null)} className="p-2 hover:bg-white/10 rounded-full text-muted transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleInvest} className="space-y-8">
                            <div>
                                <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Enter Investment Amount</label>
                                <div className="flex items-center border-b-2 border-white/20 py-2 focus-within:border-primary transition-colors">
                                    <span className="text-3xl font-bold text-primary mr-2">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full text-4xl font-bold text-white focus:outline-none bg-transparent placeholder-white/10"
                                        placeholder="500"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full text-white font-bold py-4 rounded-2xl transition-all shadow-lg text-lg ${buyModal === 'gold'
                                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 hover:shadow-[0_0_20px_var(--warning)]'
                                        : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_0_20px_var(--info)]'
                                    }`}
                            >
                                {loading ? 'Processing...' : `Invest Now`}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PhonePeWealth;
