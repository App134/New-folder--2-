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
    serverTimestamp
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
                    description: item.description || 'Revenue/Income',
                    category: 'Income'
                });
            }
            if (exp > 0) {
                flatList.push({
                    ...baseTransaction,
                    type: 'debit',
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
            savings: item.income - item.expense // Auto Savings Calculation: Income - Expense
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

    const addExpenseData = async (month, description, value, date, paymentMethod = 'Debit Card', source = '') => {
        if (!currentUser) throw new Error("User not authenticated");
        const entryDate = date ? new Date(date).toISOString() : new Date().toISOString();
        const derivedMonth = new Date(entryDate).toLocaleString('default', { month: 'short' });

        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'financial_data'), {
                month: derivedMonth,
                category: description,
                expense: Number(value),
                createdAt: entryDate,
                paymentMethod,
                source, // specific source if applicable (e.g. 'Emergency Fund')
                type: 'expense'
            });
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
            theme,
            updateTheme,
            updateTheme,
            refreshData,
            setTemporaryData
        }}>
            {children}
        </DataContext.Provider>
    );
};
