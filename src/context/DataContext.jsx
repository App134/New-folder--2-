import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    // Initial Data for Revenue Chart (Income vs Expense)
    // Initial Data for Revenue Chart (Income vs Expense)
    const [revenueData, setRevenueData] = useState([]);

    // Initial Data for Expense Pie Chart
    const [expenseData, setExpenseData] = useState([]);

    // Initial Data for Trend Line Chart (Savings)
    const [trendData, setTrendData] = useState([]);

    // Currency State
    const [currency, setCurrency] = useState('$');

    // Theme State
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

    const updateCurrency = (newCurrency) => {
        setCurrency(newCurrency);
    };

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
        const themeColors = themes[newTheme];
        if (themeColors) {
            Object.entries(themeColors).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
        }
    };

    // Initial Data loading from Firebase
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'sheet_data'), (snapshot) => {
            const rawData = snapshot.docs.map(doc => doc.data());

            // Process Revenue Data (Group by Month or existing 'name' field)
            // Assumption: Data has 'month' or 'name', 'income', 'expense' fields
            const processedRevenue = rawData.map(item => ({
                name: item.month || item.name || 'Unknown',
                income: Number(item.income) || 0,
                expense: Number(item.expense) || 0
            }));
            // Check if we actually have valid revenue data, else keep empty or default
            if (processedRevenue.length > 0) setRevenueData(processedRevenue);

            // Process Trend Data (Savings)
            const processedTrend = rawData.map(item => ({
                name: item.month || item.name || 'Unknown',
                savings: Number(item.savings) || 0
            }));
            if (processedTrend.length > 0) setTrendData(processedTrend);

            // Process Expense Data (Group by Category)
            // Assumption: Data has 'category', 'value' or derived from 'expense' + 'category'
            const categoryMap = {};
            rawData.forEach(item => {
                if (item.category && item.expense) {
                    categoryMap[item.category] = (categoryMap[item.category] || 0) + Number(item.expense);
                } else if (item.category && item.value) {
                    // Fallback for direct Pie Chart data format
                    categoryMap[item.category] = (categoryMap[item.category] || 0) + Number(item.value);
                }
            });

            const processedExpense = Object.keys(categoryMap).map(key => ({
                name: key,
                value: categoryMap[key]
            }));
            if (processedExpense.length > 0) setExpenseData(processedExpense);

        });

        return () => unsubscribe();
    }, []);

    const addRevenueData = async (month, income, expense) => {
        try {
            await addDoc(collection(db, 'sheet_data'), {
                month: month, // Using 'month' to match my reading logic
                income: Number(income),
                expense: Number(expense),
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error adding revenue document: ", error);
        }
    };

    const addExpenseData = async (month, description, value) => {
        try {
            // Use provided month or default to current month (short format)
            const monthToSave = month && month.trim() !== ''
                ? month
                : new Date().toLocaleString('default', { month: 'short' });

            await addDoc(collection(db, 'sheet_data'), {
                month: monthToSave,
                category: description, // Save description as category for record keeping
                expense: Number(value),
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error adding expense document: ", error);
        }
    };

    const addTrendData = async (month, savings) => {
        try {
            await addDoc(collection(db, 'sheet_data'), {
                month: month,
                savings: Number(savings),
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error adding savings document: ", error);
        }
    };

    return (
        <DataContext.Provider value={{
            revenueData,
            expenseData,
            trendData,
            addRevenueData,
            addExpenseData,
            addTrendData,
            currency,
            updateCurrency,
            theme,
            updateTheme
        }}>
            {children}
        </DataContext.Provider>
    );
};
