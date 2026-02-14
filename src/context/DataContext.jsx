import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    doc,
    setDoc,

    orderBy,
    serverTimestamp,
    where,
    getDocs,
    deleteDoc,
    writeBatch
} from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { currentUser } = useAuth();

    const [revenueData, setRevenueData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [aggregatedData, setAggregatedData] = useState([]); // For DataList
    const [allTransactions, setAllTransactions] = useState([]); // For Transaction History
    const [currency, setCurrency] = useState('$');
    const [theme, setTheme] = useState('dark');
    const [temporaryData, setTemporaryData] = useState([]);
    const [creditCardPayable, setCreditCardPayable] = useState(0);
    const [budget, setBudget] = useState(0);
    const [ccDueDate, setCCDueDate] = useState(1);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [alerts, setAlerts] = useState([]);

    const themes = {
        dark: {
            '--bg-primary': '#0f172a',
            '--bg-secondary': '#1e293b',
            '--bg-card': '#1e293b',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#94a3b8'
        },
        light: {
            '--bg-primary': '#f8fafc',
            '--bg-secondary': '#ffffff',
            '--bg-card': '#ffffff',
            '--text-primary': '#0f172a',
            '--text-secondary': '#64748b'
        },
        midnight: {
            '--bg-primary': '#000000',
            '--bg-secondary': '#111111',
            '--bg-card': '#111111',
            '--text-primary': '#e5e5e5',
            '--text-secondary': '#a3a3a3'
        },
        ocean: {
            '--bg-primary': '#0c4a6e',
            '--bg-secondary': '#075985',
            '--bg-card': '#075985',
            '--text-primary': '#f0f9ff',
            '--text-secondary': '#bae6fd'
        }
    };

    const processData = (rawData) => {
        // 1. Aggregate by Month
        const tempMap = {};

        // 2. Flatten for Transaction History
        let flatList = [];

        rawData.forEach(item => {
            // Aggregate Logic (existing)
            let monthRaw = (item.month || item.name || 'Unknown').trim();
            if (monthRaw && monthRaw.length > 0) {
                monthRaw = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1).toLowerCase();
            }
            const monthKey = monthRaw;

            if (!tempMap[monthKey]) {
                tempMap[monthKey] = {
                    id: monthKey,
                    month: monthKey,
                    income: 0,
                    expense: 0,
                    savings: 0,
                    lastUpdated: item.createdAt || ''
                };
            }

            const parseAmount = (val) => {
                if (val === undefined || val === null) return 0;
                if (typeof val === 'number') return val;
                const str = String(val).replace(/[^0-9.-]/g, '');
                return parseFloat(str) || 0;
            };

            const inc = parseAmount(item.income) || parseAmount(item.Income) || 0;
            const exp = parseAmount(item.expense) || parseAmount(item.Expense) || parseAmount(item.value) || 0;
            const sav = parseAmount(item.savings) || parseAmount(item.Savings) || 0;

            tempMap[monthKey].income += inc;
            tempMap[monthKey].expense += exp;
            tempMap[monthKey].savings += sav;

            if (item.createdAt && (!tempMap[monthKey].lastUpdated || item.createdAt > tempMap[monthKey].lastUpdated)) {
                tempMap[monthKey].lastUpdated = item.createdAt;
            }

            // Transaction History Logic
            // Create separate entries for income, expense, savings if they exist in the same doc
            const baseTransaction = {
                id: item.id,
                date: item.createdAt || new Date().toISOString(),
                month: monthKey,
                originalDoc: item
            };

            if (inc > 0) {
                flatList.push({
                    ...baseTransaction,
                    type: 'credit',
                    amount: inc,
                    description: item.category || item.description || 'Revenue/Income',
                    category: 'Income'
                });
            }
            if (exp > 0) {
                const isSaving = item.type === 'Saving' || item.type === 'Investment';
                flatList.push({
                    ...baseTransaction,
                    type: isSaving ? 'Saving' : 'debit',
                    amount: exp,
                    description: item.category || item.description || 'Expense',
                    category: item.category || 'Expense'
                });
            }
            if (sav > 0) {
                flatList.push({
                    ...baseTransaction,
                    type: 'debit',
                    amount: sav,
                    description: 'Manual Savings Contribution',
                    category: 'Savings'
                });
            }
            if (item.type === 'repayment') {
                flatList.push({
                    ...baseTransaction,
                    type: 'debit', // Money leaves bank to pay CC
                    amount: Number(item.amount),
                    description: 'Credit Card Repayment',
                    category: 'Repayment'
                });
            }
        });

        // Sort flatList by Date Ascending to calculate running balance
        flatList.sort((a, b) => new Date(a.date) - new Date(b.date));

        let currentBalance = 0;
        const transactionsWithBalance = flatList.map(t => {
            if (t.type === 'credit') {
                currentBalance += t.amount;
            } else {
                // If it's a Credit Card expense, it doesn't reduce "Cash" running balance immediately
                // Only "Repayment" or "Debit Card" or "Cash" reduces running balance
                if (t.originalDoc?.paymentMethod !== 'Credit Card') {
                    currentBalance -= t.amount;
                }
            }
            return { ...t, runningBalance: currentBalance };
        });

        // Reverse for display (Newest first)
        setAllTransactions([...transactionsWithBalance].reverse());


        // Convert aggregated map to array and sort by recency
        const aggregatedList = Object.values(tempMap);
        aggregatedList.sort((a, b) => {
            if (a.lastUpdated > b.lastUpdated) return -1;
            if (a.lastUpdated < b.lastUpdated) return 1;
            return 0;
        });

        setAggregatedData(aggregatedList);

        // Prepare Sub-States
        const processedRevenue = aggregatedList.map(item => ({
            name: item.month,
            income: item.income,
            expense: item.expense
        }));
        if (processedRevenue.length > 0) setRevenueData(processedRevenue);

        const processedTrend = aggregatedList.map(item => ({
            name: item.month,
            savings: (item.income - item.expense) + (item.savings || 0) // Auto Savings (Surplus) + Manual Investments
        }));
        if (processedTrend.length > 0) setTrendData(processedTrend);

        // Credit Card Payable Calculation
        // Payable = Total Credit Card Spending - Total Repayments
        let totalCCSpending = 0;
        let totalRepayments = 0;

        flatList.forEach(t => {
            if (t.originalDoc?.paymentMethod === 'Credit Card') {
                totalCCSpending += t.amount;
            }
            if (t.category === 'Repayment') {
                totalRepayments += t.amount;
            }
        });

        const ccPayable = totalCCSpending - totalRepayments;
        // Expose this via a new state or attach to aggregatedData?
        // Let's attach to the latest month or just as a global context value
        // For now, let's just log it or we might need another state variable.
        // Actually, let's keep it simple: We'll calculate it in Dashboard using allTransactions if needed, 
        // OR essentially we can just expose it. A new state is cleaner.


        // Process Expense Data (Group by Category)
        const categoryMap = {};
        rawData.forEach(item => {
            // Re-evaluating based on raw data to catch all categories
            const val = Number(item.expense) || Number(item.value) || 0;
            if ((item.category) && val > 0) {
                categoryMap[item.category] = (categoryMap[item.category] || 0) + val;
            }
        });

        const processedExpense = Object.keys(categoryMap).map(key => ({
            name: key,
            value: categoryMap[key]
        }));
        if (processedExpense.length > 0) setExpenseData(processedExpense);

        setCreditCardPayable(ccPayable);
    };

    const updateTheme = async (newTheme) => {
        setTheme(newTheme);
        const themeColors = themes[newTheme];
        if (themeColors) {
            Object.entries(themeColors).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
        }
        if (currentUser) {
            try {
                const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'preferences');
                await setDoc(settingsRef, { theme: newTheme }, { merge: true });
            } catch (err) {
                console.error("Error updating theme:", err);
            }
        }
    };

    const updateCurrency = async (newCurrency) => {
        setCurrency(newCurrency);
        if (currentUser) {
            try {
                const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'preferences');
                await setDoc(settingsRef, { currency: newCurrency }, { merge: true });
            } catch (err) {
                console.error("Error updating currency:", err);
            }
        }
    }


    const updateBudget = async (newBudget) => {
        setBudget(newBudget);
        if (currentUser) {
            try {
                const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'preferences');
                await setDoc(settingsRef, { budget: Number(newBudget) }, { merge: true });
            } catch (err) {
                console.error("Error updating budget:", err);
            }
        }
    };

    const updateCCDueDate = async (newDate) => {
        setCCDueDate(newDate);
        if (currentUser) {
            try {
                const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'preferences');
                await setDoc(settingsRef, { ccDueDate: Number(newDate) }, { merge: true });
            } catch (err) {
                console.error("Error updating CC due date:", err);
            }
        }
    };

    // Load User Settings
    useEffect(() => {
        if (!currentUser) return;

        const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'preferences');
        const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.theme) {
                    setTheme(data.theme);
                    const themeColors = themes[data.theme];
                    if (themeColors) {
                        Object.entries(themeColors).forEach(([key, value]) => {
                            document.documentElement.style.setProperty(key, value);
                        });
                    }
                }
                if (data.currency) setCurrency(data.currency);
                if (data.budget !== undefined) setBudget(data.budget);
                if (data.ccDueDate !== undefined) setCCDueDate(data.ccDueDate);
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Real-time Data Listener
    useEffect(() => {
        if (!currentUser) {
            setAggregatedData([]);
            setRevenueData([]);
            setExpenseData([]);
            setTrendData([]);
            setAllTransactions([]);
            return;
        }

        const dataRef = collection(db, 'users', currentUser.uid, 'financial_data');
        const q = query(dataRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Merge with temporary data (from live sheet)
            processData([...fetchedData, ...temporaryData]);
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => unsubscribe();
    }, [currentUser, temporaryData]); // Re-run when temporaryData changes



    const refreshData = () => {
        // No-op for Firestore listener
    };

    const addRevenueData = async (month, income, expense, date) => {
        if (!currentUser) throw new Error("User not authenticated");
        const entryDate = date ? new Date(date).toISOString() : new Date().toISOString();
        const derivedMonth = new Date(entryDate).toLocaleString('default', { month: 'short' });

        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'financial_data'), {
                month: derivedMonth,
                income: Number(income),
                expense: Number(expense),
                createdAt: entryDate
            });
        } catch (err) {
            console.error("Error adding revenue:", err);
            throw err;
        }
    };

    const addExpenseData = async (month, description, value, date, paymentMethod = 'Debit Card', source = '', type = 'expense') => {
        if (!currentUser) throw new Error("User not authenticated");
        const entryDate = date ? new Date(date).toISOString() : new Date().toISOString();
        const derivedMonth = new Date(entryDate).toLocaleString('default', { month: 'short' });

        try {
            const dataToSave = {
                month: derivedMonth,
                category: description,
                description: description, // Explicitly save description
                createdAt: entryDate,
                paymentMethod,
                source,
                type
            };

            if (type === 'credit') {
                dataToSave.income = Number(value);
                dataToSave.expense = 0;
            } else {
                dataToSave.income = 0;
                dataToSave.expense = Number(value);
                if (type === 'Saving') {
                    dataToSave.savings = Number(value);
                }
            }

            await addDoc(collection(db, 'users', currentUser.uid, 'financial_data'), dataToSave);
        } catch (err) {
            console.error("Error adding expense:", err);
            throw err;
        }
    };

    const repayCreditCard = async (amount, date) => {
        if (!currentUser) throw new Error("User not authenticated");
        const entryDate = date ? new Date(date).toISOString() : new Date().toISOString();
        const derivedMonth = new Date(entryDate).toLocaleString('default', { month: 'short' });

        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'financial_data'), {
                month: derivedMonth,
                amount: Number(amount),
                createdAt: entryDate,
                type: 'repayment',
                description: 'Credit Card Repayment'
            });
        } catch (err) {
            console.error("Error adding repayment:", err);
            throw err;
        }
    };

    const addTrendData = async (month, savings, date) => {
        if (!currentUser) throw new Error("User not authenticated");
        const entryDate = date ? new Date(date).toISOString() : new Date().toISOString();
        const derivedMonth = new Date(entryDate).toLocaleString('default', { month: 'short' });

        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'financial_data'), {
                month: derivedMonth,
                savings: Number(savings),
                createdAt: entryDate
            });
        } catch (err) {
            console.error("Error adding trend data:", err);
            throw err;
        }
    };

    const importData = async (newItems) => {
        if (!currentUser) throw new Error("User not authenticated");
        const promises = newItems.map(item => {
            return addDoc(collection(db, 'users', currentUser.uid, 'financial_data'), {
                ...item,
                createdAt: item.createdAt || new Date().toISOString() // Ensure createdAt is preserved if passed
            });
        });

        await Promise.all(promises);
    };

    const addGoal = async (goalData) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'goals'), {
                ...goalData,
                createdAt: new Date().toISOString(),
                currentAmount: 0 // Start with 0
            });
        } catch (err) {
            console.error("Error adding goal:", err);
            throw err;
        }
    };

    const deleteGoal = async (goalId) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'goals', goalId));
        } catch (err) {
            console.error("Error deleting goal:", err);
            throw err;
        }
    };

    const deleteTransaction = async (transactionId) => {
        if (!currentUser) throw new Error("User not authenticated");
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'financial_data', transactionId));
        } catch (err) {
            console.error("Error deleting transaction:", err);
            throw err;
        }
    };

    const updateGoalAmount = async (goalId, newAmount) => {
        if (!currentUser) return;
        try {
            await setDoc(doc(db, 'users', currentUser.uid, 'goals', goalId), {
                currentAmount: Number(newAmount)
            }, { merge: true });
        } catch (err) {
            console.error("Error updating goal amount:", err);
            throw err;
        }
    };

    // Listen to Goals
    useEffect(() => {
        if (!currentUser) {
            setSavingsGoals([]);
            return;
        }
        const q = query(collection(db, 'users', currentUser.uid, 'goals'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setSavingsGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [currentUser]);

    const [notifications, setNotifications] = useState([]);

    // --- Notification Logic ---

    // Helper to add a persistent notification with deduplication
    const addNotification = async (notificationData) => {
        if (!currentUser) return;
        const { dateKey, type, title, message } = notificationData;

        // Deduplication check
        const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
        const q = query(notificationsRef, where('dateKey', '==', dateKey));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Notification for this event/period already exists
            return;
        }

        try {
            await addDoc(notificationsRef, {
                type,
                title,
                message,
                dateKey,
                isRead: false,
                timestamp: serverTimestamp()
            });
        } catch (err) {
            console.error("Error adding notification:", err);
        }
    };

    const markAsRead = async (id) => {
        if (!currentUser) return;
        try {
            const notifRef = doc(db, 'users', currentUser.uid, 'notifications', id);
            await setDoc(notifRef, { isRead: true }, { merge: true });
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser) return;
        const batch = writeBatch(db);
        notifications.forEach(notif => {
            if (!notif.isRead) {
                const ref = doc(db, 'users', currentUser.uid, 'notifications', notif.id);
                batch.update(ref, { isRead: true });
            }
        });
        try {
            await batch.commit();
        } catch (err) {
            console.error("Error marking all as read:", err);
        }
    };

    const clearNotification = async (id) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'notifications', id));
        } catch (err) {
            console.error("Error clearing notification:", err);
        }
    };

    const clearAllNotifications = async () => {
        if (!currentUser) return;
        const batch = writeBatch(db);
        notifications.forEach(notif => {
            const ref = doc(db, 'users', currentUser.uid, 'notifications', notif.id);
            batch.delete(ref);
        });
        try {
            await batch.commit();
        } catch (err) {
            console.error("Error clearing all notifications:", err);
        }
    };

    // Listen to Notifications
    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            return;
        }
        const q = query(
            collection(db, 'users', currentUser.uid, 'notifications'),
            orderBy('timestamp', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [currentUser]);

    // Calculate Alerts & Generate Notifications
    useEffect(() => {
        const newAlerts = [];
        const currentMonth = new Date().toLocaleString('default', { month: 'short' });
        const currentYear = new Date().getFullYear();
        const monthKey = `${currentMonth}-${currentYear}`;

        // 1. Budget Alert
        const currentMonthRevenue = revenueData.find(item => item.name === currentMonth);
        const currentExpense = currentMonthRevenue ? currentMonthRevenue.expense : 0;

        if (budget > 0) {
            const budgetRatio = currentExpense / budget;
            if (budgetRatio >= 1) {
                newAlerts.push({
                    id: 'budget-exceeded',
                    type: 'danger',
                    title: 'Budget Exceeded',
                    message: `You have exceeded your monthly budget.`,
                });
                // Persistent Notification
                addNotification({
                    dateKey: `budget-exceeded-${monthKey}`,
                    type: 'budget',
                    title: 'Budget Exceeded',
                    message: `You have exceeded your budget of ${currency}${budget} for ${currentMonth}.`
                });
            } else if (budgetRatio >= 0.8) {
                newAlerts.push({
                    id: 'budget-warning',
                    type: 'warning',
                    title: 'Approaching Budget Limit',
                    message: `You have used ${Math.round(budgetRatio * 100)}% of your monthly budget.`,
                });
                // Persistent Notification (Only once when crossing 80%)
                addNotification({
                    dateKey: `budget-warning-${monthKey}`,
                    type: 'budget',
                    title: 'Budget Warning',
                    message: `You used 80% of your budget for ${currentMonth}.`
                });
            }
        }

        // 2. Savings Alert
        const currentIncome = currentMonthRevenue ? currentMonthRevenue.income : 0;
        if (currentIncome > 0) {
            if (currentExpense > currentIncome * 0.9) {
                newAlerts.push({
                    id: 'low-savings',
                    type: 'warning',
                    title: 'Low Savings Rate',
                    message: `Expenses are ${Math.round((currentExpense / currentIncome) * 100)}% of income.`,
                });
                addNotification({
                    dateKey: `low-savings-${monthKey}`,
                    type: 'savings',
                    title: 'Low Savings',
                    message: `Your savings rate is critically low for ${currentMonth}.`
                });
            }
        }

        // 3. High Category Spending
        if (currentExpense > 0 && expenseData.length > 0) {
            expenseData.forEach(cat => {
                if ((cat.value / currentExpense) > 0.40) {
                    newAlerts.push({
                        id: `high-cat-${cat.name}`,
                        type: 'info',
                        title: `High Spending in ${cat.name}`,
                        message: `${cat.name} is ${Math.round((cat.value / currentExpense) * 100)}% of total expenses.`,
                    });
                    // Only notify if significant amount ($100+) to avoid noise on small budgets
                    if (cat.value > 100) {
                        addNotification({
                            dateKey: `high-cat-${cat.name}-${monthKey}`,
                            type: 'info',
                            title: `High Spending: ${cat.name}`,
                            message: `You spent ${currency}${cat.value} on ${cat.name} this month.`
                        });
                    }
                }
            });
        }

        // 4. Credit Card Bill Due
        if (creditCardPayable > 0) {
            const today = new Date();
            const dueDay = ccDueDate;
            const currentDay = today.getDate(); // 1-31

            // Check if we are in the same month as the due calculation or if it's generally due
            // For simplicity, we create a key based on TODAY's date string to allow re-notification if still unpaid next day?
            // Or just once per month cycle? Let's do once per month cycle "cc-due-Month-Year".

            let daysDiff = dueDay - currentDay;

            if (daysDiff < 0) {
                newAlerts.push({
                    id: 'cc-overdue',
                    type: 'danger',
                    title: 'Credit Card Bill Overdue',
                    message: `Bill was due on day ${dueDay}. Pay immediately.`,
                });
                addNotification({
                    dateKey: `cc-overdue-${monthKey}`,
                    type: 'reminder',
                    title: 'Bill Overdue',
                    message: `Your credit card bill was due on the ${dueDay}th!`
                });
            } else if (daysDiff <= 3) { // Notify only if very close (3 days)
                newAlerts.push({
                    id: 'cc-due-soon',
                    type: 'warning',
                    title: 'Credit Card Bill Due Soon',
                    message: `Bill due in ${daysDiff === 0 ? 'today' : daysDiff + ' days'}.`,
                });
                addNotification({
                    dateKey: `cc-due-soon-${monthKey}`,
                    type: 'reminder',
                    title: 'Bill Due Soon',
                    message: `Your credit card bill is due in ${daysDiff === 0 ? 'today' : daysDiff + ' days'}.`
                });
            }
        }

        setAlerts(newAlerts);
    }, [revenueData, expenseData, budget, creditCardPayable, ccDueDate]);

    return (
        <DataContext.Provider value={{
            revenueData,
            expenseData,
            trendData,
            aggregatedData,
            allTransactions,
            creditCardPayable,
            addRevenueData,
            addExpenseData,
            addTrendData,
            repayCreditCard,
            importData,
            currency,
            updateCurrency,
            budget,
            updateBudget,
            ccDueDate,
            updateCCDueDate,
            savingsGoals,
            addGoal,
            deleteGoal,
            updateGoalAmount,
            theme,
            updateTheme,
            deleteTransaction,

            refreshData,
            setTemporaryData,
            alerts,
            notifications,
            markAsRead,
            markAllAsRead,
            clearNotification,
            clearAllNotifications
        }}>
            {children}
        </DataContext.Provider>
    );
};
