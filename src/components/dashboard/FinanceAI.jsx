import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Sparkles, ChevronRight } from 'lucide-react';
import './FinanceAI.css';

const FinanceAI = () => {
    const { revenueData, expenseData, budget, currency, savingsGoals } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your Finance Assistant. Ask me about your budget, savings, or spending trends!", sender: 'bot' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const quickChips = [
        "How is my budget?",
        "Top expense?",
        "Savings status",
        "Financial advice"
    ];

    // --- GOAL PLANNING STATE ---
    const [planningStep, setPlanningStep] = useState('IDLE'); // IDLE, ASK_PRICE, ASK_TIME
    const [tempGoal, setTempGoal] = useState({ name: '', price: 0 });

    const generateResponse = (query) => {
        const lowerQuery = query.toLowerCase();
        const currentMonth = new Date().toLocaleString('default', { month: 'short' });
        const currentData = revenueData.find(d => d.name === currentMonth) || { income: 0, expense: 0 };

        // --- 1. GOAL PLANNING FLOW ---

        // Step 1: Detect Goal Intent
        if (planningStep === 'IDLE' && (lowerQuery.includes('buy') || lowerQuery.includes('purchase') || lowerQuery.includes('goal'))) {
            setPlanningStep('ASK_PRICE');
            // Try to extract goal name
            const words = query.split(' ');
            const buyIndex = words.findIndex(w => w.toLowerCase().includes('buy') || w.toLowerCase().includes('purchase'));
            let goalName = "your goal";
            if (buyIndex !== -1 && buyIndex < words.length - 1) {
                goalName = words.slice(buyIndex + 1).join(' ').replace(/[?.!]/g, '');
            }
            setTempGoal({ name: goalName, price: 0 });
            return `That's exciting! 🚴‍♂️ How much does "${goalName}" cost? (Enter amount in ${currency})`;
        }

        // Step 2: Handle Price Input
        if (planningStep === 'ASK_PRICE') {
            const amount = parseFloat(query.replace(/[^0-9.]/g, ''));
            if (!amount || amount <= 0) {
                return "Please enter a valid amount (e.g., 5000).";
            }
            setTempGoal(prev => ({ ...prev, price: amount }));
            setPlanningStep('ASK_TIME');
            return `Got it! ${currency}${amount.toLocaleString()}. When do you want to buy it? (Enter number of months, e.g., "6" or type "skip")`;
        }

        // Step 3: Handle Time Input & Calculate
        if (planningStep === 'ASK_TIME') {
            let monthsElement = 0;
            if (!lowerQuery.includes('skip')) {
                monthsElement = parseInt(query.replace(/[^0-9]/g, '')) || 0;
            }

            // PERFORM CALCULATIONS
            const avgIncome = revenueData.reduce((acc, curr) => acc + curr.income, 0) / (revenueData.length || 1);
            const avgExpense = revenueData.reduce((acc, curr) => acc + curr.expense, 0) / (revenueData.length || 1);
            const currentSavings = currentData.income - currentData.expense; // This month's actual savings
            const avgSavings = avgIncome - avgExpense;

            // Safe fallback if data is missing
            const monthlySavings = avgSavings > 0 ? avgSavings : (currentSavings > 0 ? currentSavings : 0);

            const price = tempGoal.price;

            // Scenario 1: User provided a timeline
            let response = `🎯 **Plan for ${tempGoal.name} (${currency}${price.toLocaleString()})**\n\n`;

            if (monthsElement > 0) {
                const requiredMonthly = price / monthsElement;
                response += `To buy it in **${monthsElement} months**, you need to save **${currency}${Math.ceil(requiredMonthly).toLocaleString()}/month**.\n`;

                if (monthlySavings >= requiredMonthly) {
                    response += `✅ **Feasible!** Your average savings are ${currency}${Math.ceil(monthlySavings).toLocaleString()}/month. You're on track!`;
                } else {
                    const deficit = requiredMonthly - monthlySavings;
                    response += `⚠️ **Challenging.** You currently save about ${currency}${Math.ceil(monthlySavings).toLocaleString()}/month.\n`;
                    response += `💡 **Tip:** Try to reduce expenses by ${currency}${Math.ceil(deficit).toLocaleString()} or extend your timeline.`;
                }
            } else {
                // Scenario 2: No timeline, suggest one
                if (monthlySavings > 0) {
                    const monthsToGoal = Math.ceil(price / monthlySavings);
                    response += `Based on your current savings (${currency}${Math.ceil(monthlySavings).toLocaleString()}/month), you could afford this in **${monthsToGoal} months**.\n`;
                    response += `💡 **Suggestion:** Save ${currency}${Math.ceil(price / (monthsToGoal - 1 || 1)).toLocaleString()} to get it a month earlier!`;
                } else {
                    response += `It looks like your expenses match or exceed your income right now.\n`;
                    response += `💡 **Advice:** Try to lower your top expense category to start saving for this goal.`;
                }
            }

            setPlanningStep('IDLE'); // Reset
            return response;
        }

        // --- STANDARD QUERIES (Existing Logic) ---

        // 1. Budget Queries
        if (lowerQuery.includes('budget')) {
            if (budget === 0) return "You haven't set a budget yet. Go to settings to set one!";
            const used = currentData.expense;
            const remaining = budget - used;
            const percent = Math.round((used / budget) * 100);

            if (percent > 100) return `⚠️ You've exceeded your budget by ${currency}${Math.abs(remaining).toLocaleString()}! You're at ${percent}%.`;
            if (percent > 80) return `You've used ${percent}% of your budget. You have ${currency}${remaining.toLocaleString()} left. Be careful!`;
            return `You're doing great! You've used ${percent}% of your budget. ${currency}${remaining.toLocaleString()} remaining.`;
        }

        // 2. Spending / Expense Queries
        if (lowerQuery.includes('spent') || lowerQuery.includes('expense') || lowerQuery.includes('spending')) {
            if (lowerQuery.includes('top') || lowerQuery.includes('highest') || lowerQuery.includes('most')) {
                if (expenseData.length === 0) return "No expense data available yet.";
                const sorted = [...expenseData].sort((a, b) => b.value - a.value);
                const top = sorted[0];
                return `Your highest spending category is **${top.name}** at ${currency}${top.value.toLocaleString()}.`;
            }
            return `You've spent ${currency}${currentData.expense.toLocaleString()} in ${currentMonth} so far.`;
        }

        // 3. Income / Earnings
        if (lowerQuery.includes('income') || lowerQuery.includes('earn') || lowerQuery.includes('make')) {
            return `You've earned ${currency}${currentData.income.toLocaleString()} in ${currentMonth}.`;
        }

        // 4. Savings
        if (lowerQuery.includes('saving')) {
            const savings = currentData.income - currentData.expense;
            const rate = currentData.income > 0 ? Math.round((savings / currentData.income) * 100) : 0;

            let msg = `Your savings for ${currentMonth} are ${currency}${savings.toLocaleString()} (${rate}% rate).`;
            if (rate < 10) msg += " Try to aim for at least 20%!";
            else if (rate > 30) msg += " Excellent work! 🚀";

            if (savingsGoals.length > 0) {
                const topGoal = savingsGoals[0];
                msg += ` Don't forget your "${topGoal.name}" goal!`;
            }
            return msg;
        }

        // 5. Advice / Suggestion
        if (lowerQuery.includes('advice') || lowerQuery.includes('suggest') || lowerQuery.includes('help')) {
            if (currentData.expense > currentData.income * 0.9) return "Warning: Your expenses are very high relative to your income. Review your subscription and dining costs.";
            if (budget === 0) return "Tip: Setting a monthly budget is the best step to financial freedom.";
            if (expenseData.length > 0) {
                const sorted = [...expenseData].sort((a, b) => b.value - a.value);
                return `Tip: Try reducing your spending on ${sorted[0].name} to save more this month.`;
            }
            return "Rule of thumb: Aim for the 50/30/20 rule. 50% Needs, 30% Wants, 20% Savings.";
        }

        // Default
        return "I can help with checking your budget, top expenses, savings, or help you plan a purchase/goal! Try satisfying 'I want to buy a car'.";
    };

    const handleSend = async (text) => {
        if (!text.trim()) return;

        // Add User Message
        const userMsg = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Delay
        setTimeout(() => {
            const replyText = generateResponse(text);
            const botMsg = { id: Date.now() + 1, text: replyText, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <>
            {/* Floating FAB */}
            <motion.button
                className="finance-ai-fab"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <X size={24} /> : <Bot size={28} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="finance-ai-window"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    >
                        <div className="ai-header">
                            <div className="ai-header-title">
                                <Sparkles size={18} className="text-yellow-400" />
                                <span>Finance Assistant</span>
                            </div>
                            <span className="ai-status">Online</span>
                        </div>

                        <div className="ai-messages">
                            {messages.map(msg => (
                                <div key={msg.id} className={`message ${msg.sender}`}>
                                    {msg.sender === 'bot' && <div className="bot-avatar"><Bot size={16} /></div>}
                                    <div className="message-bubble">
                                        {msg.text.split('**').map((chunk, i) =>
                                            i % 2 === 1 ? <strong key={i}>{chunk}</strong> : chunk
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message bot">
                                    <div className="bot-avatar"><Bot size={16} /></div>
                                    <div className="message-bubble typing">
                                        <span>.</span><span>.</span><span>.</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Chips */}
                        <div className="ai-chips">
                            {quickChips.map((chip, idx) => (
                                <button key={idx} onClick={() => handleSend(chip)}>
                                    {chip} <ChevronRight size={12} />
                                </button>
                            ))}
                        </div>

                        <div className="ai-input-area">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                                placeholder="Ask about output expenses..."
                            />
                            <button onClick={() => handleSend(input)} className="send-btn">
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FinanceAI;
