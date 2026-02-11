import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { CreditCard, Bell, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore'; // Import needed for saving ccDueDate if changed here
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';

const BillReminder = () => {
    const { creditCardPayable, ccDueDate, updateCCDueDate, currency, theme } = useData();
    const { currentUser } = useAuth();

    // State for local editing of due date
    const [isEditing, setIsEditing] = useState(false);
    const [newDueDate, setNewDueDate] = useState(ccDueDate);

    useEffect(() => {
        setNewDueDate(ccDueDate);
    }, [ccDueDate]);

    const handleSaveDate = () => {
        updateCCDueDate(newDueDate);
        setIsEditing(false);
    };

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-indexed
    const currentYear = today.getFullYear();

    // Determine target Due Date
    // If today > ccDueDate, assuming it's due next month?
    // Or if bill is generated on 1st, due on 20th.
    // Let's assume ccDueDate IS the day of the month payment is due.

    let targetDate = new Date(currentYear, currentMonth, ccDueDate);

    // If today is past the due date, we might assume the NEXT due date is next month
    // BUT, if there is still payable amount, it might be Overdue!
    // Let's logic: 
    // If creditCardPayable <= 0, we don't really have a "bill" urgency, but we show next due date.
    // If creditCardPayable > 0:
    //    If today > ccDueDate, it's OVERDUE (or due next month depending on cycle, but safer to warn).
    //    If today <= ccDueDate, it's Upcoming.

    let status = 'upcoming'; // upcoming, due-soon, overdue, paid
    let daysLeft = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));

    if (creditCardPayable <= 0) {
        status = 'paid';
    } else {
        if (daysLeft < 0) {
            // Check if it was due this month or previous?
            // Simple logic: If existing payable and date passed, it's overdue.
            status = 'overdue';
        } else if (daysLeft <= 3) {
            status = 'due-soon';
        }
    }

    // Styles based on status
    let cardStyle = {
        background: 'var(--bg-card)',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        color: 'var(--text-primary)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    };

    let iconColor = '#3b82f6';
    let statusMessage = '';

    if (status === 'paid') {
        iconColor = '#10b981';
        statusMessage = "All caught up! No payment due.";
    } else if (status === 'overdue') {
        iconColor = '#ef4444';
        statusMessage = `Overdue by ${Math.abs(daysLeft)} days! Pay immediately.`;
        cardStyle.border = '1px solid rgba(239, 68, 68, 0.5)';
    } else if (status === 'due-soon') {
        iconColor = '#f59e0b';
        statusMessage = `Due in ${daysLeft} days. Don't miss it!`;
        cardStyle.border = '1px solid rgba(245, 158, 11, 0.5)';
    } else {
        statusMessage = `Due on ${targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.`;
    }

    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <CreditCard size={20} />
                    <span>Bill Reminder</span>
                </div>
                {status !== 'paid' && (
                    <div style={{ background: iconColor, color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                        {currency}{creditCardPayable.toLocaleString()}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    background: `rgba(255, 255, 255, 0.05)`,
                    padding: '0.75rem',
                    borderRadius: '50%',
                    color: iconColor
                }}>
                    {status === 'paid' ? <CheckCircle size={24} /> :
                        status === 'overdue' ? <AlertCircle size={24} /> :
                            <Bell size={24} />}
                </div>
                <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{statusMessage}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Due Date:
                        {isEditing ? (
                            <select
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                onBlur={handleSaveDate}
                                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--text-secondary)', borderRadius: '4px' }}
                            >
                                {[...Array(28)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                        ) : (
                            <span
                                onClick={() => setIsEditing(true)}
                                style={{ cursor: 'pointer', borderBottom: '1px dashed var(--text-secondary)' }}
                                title="Click to edit due date"
                            >
                                Day {ccDueDate}
                            </span>
                        )}
                        of every month
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillReminder;
