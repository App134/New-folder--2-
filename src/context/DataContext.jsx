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
    const [currency, setCurrency] = useState('$');
    const [theme, setTheme] = useState('dark');

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

        rawData.forEach(item => {
            // Normalize month: use 'month' field if present, otherwise 'name' or 'Unknown'
            let monthRaw = (item.month || item.name || 'Unknown').trim();
            // Capitalize first letter
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

            tempMap[monthKey].income += Number(item.income) || 0;
            tempMap[monthKey].expense += Number(item.expense) || 0;
            tempMap[monthKey].savings += Number(item.savings) || 0;

            // Keep track of latest update
            if (item.createdAt && (!tempMap[monthKey].lastUpdated || item.createdAt > tempMap[monthKey].lastUpdated)) {
                tempMap[monthKey].lastUpdated = item.createdAt;
            }
        });

        // Convert to array and sort by recency
        const aggregatedList = Object.values(tempMap);
        aggregatedList.sort((a, b) => {
            // Sort by lastUpdated desc
            if (a.lastUpdated > b.lastUpdated) return -1;
            if (a.lastUpdated < b.lastUpdated) return 1;
            return 0;
        });

        setAggregatedData(aggregatedList);

        // 2. Prepare Revenue Data
        const processedRevenue = aggregatedList.map(item => ({
            name: item.month,
            income: item.income,
            expense: item.expense
        }));
        if (processedRevenue.length > 0) setRevenueData(processedRevenue);

        // 3. Prepare Trend Data
        const processedTrend = aggregatedList.map(item => ({
            name: item.month,
            savings: item.savings
        }));
        if (processedTrend.length > 0) setTrendData(processedTrend);

        // 4. Process Expense Data (Group by Category)
        const categoryMap = {};
        rawData.forEach(item => {
            if (item.category && item.expense) {
                categoryMap[item.category] = (categoryMap[item.category] || 0) + Number(item.expense);
            } else if (item.category && item.value) {
                categoryMap[item.category] = (categoryMap[item.category] || 0) + Number(item.value);
            }
        });

        const processedExpense = Object.keys(categoryMap).map(key => ({
            name: key,
            value: categoryMap[key]
        }));
        if (processedExpense.length > 0) setExpenseData(processedExpense);
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
            // Reset data if no user
            setAggregatedData([]);
            setRevenueData([]);
            setExpenseData([]);
            setTrendData([]);
            return;
        }

        const dataRef = collection(db, 'users', currentUser.uid, 'financial_data');
        const q = query(dataRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            processData(fetchedData);
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Placeholder for manual refresh (Firestore is real-time, but keeping API compatible)
    const refreshData = () => {
        // No-op for Firestore listener
    };

    const addRevenueData = async (month, income, expense) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'financial_data'), {
                month,
                income: Number(income),
                expense: Number(expense),
                createdAt: new Date().toISOString()
            });
        } catch (err) {
            console.error("Error adding revenue:", err);
            throw err;
        }
    };

    const addExpenseData = async (month, description, value) => {
        if (!currentUser) return;
        const monthToSave = month && month.trim() !== ''
            ? month
            : new Date().toLocaleString('default', { month: 'short' });

        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'financial_data'), {
                month: monthToSave,
                category: description,
                expense: Number(value),
                createdAt: new Date().toISOString()
            });
        } catch (err) {
            console.error("Error adding expense:", err);
            throw err;
        }
    };

    const addTrendData = async (month, savings) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'financial_data'), {
                month,
                savings: Number(savings),
                createdAt: new Date().toISOString()
            });
        } catch (err) {
            console.error("Error adding trend data:", err);
            throw err;
        }
    };

    const importData = async (newItems) => {
        if (!currentUser) return;
        // Batch writes would be better for many items, but keeping it simple for now
        const promises = newItems.map(item => {
            return addDoc(collection(db, 'users', currentUser.uid, 'financial_data'), {
                ...item,
                createdAt: new Date().toISOString()
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
            addRevenueData,
            addExpenseData,
            addTrendData,
            importData,
            currency,
            updateCurrency,
            theme,
            updateTheme,
            refreshData
        }}>
            {children}
        </DataContext.Provider>
    );
};
