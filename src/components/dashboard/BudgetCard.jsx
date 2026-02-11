import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Wallet, Edit2, AlertTriangle, CheckCircle } from 'lucide-react';
import './BudgetCard.css';

const BudgetCard = () => {
    const { budget, updateBudget, currency, revenueData } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState(budget);

    // Calculate current month's expense
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const currentMonthData = revenueData.find(item => item.name === currentMonth);
    const currentExpense = currentMonthData ? currentMonthData.expense : 0;

    useEffect(() => {
        setNewBudget(budget);
    }, [budget]);

    const handleSave = () => {
        updateBudget(newBudget);
        setIsEditing(false);
    };

    const percentage = budget > 0 ? Math.min((currentExpense / budget) * 100, 100) : 0;

    let statusColor = '#10b981'; // Green
    let statusText = 'On Track';
    let StatusIcon = CheckCircle;

    if (percentage >= 100) {
        statusColor = '#ef4444'; // Red
        statusText = 'Over Budget';
        StatusIcon = AlertTriangle;
    } else if (percentage >= 80) {
        statusColor = '#f59e0b'; // Orange
        statusText = 'Approaching Limit';
        StatusIcon = AlertTriangle;
    }

    return (
        <div className="budget-card">
            <div className="budget-header">
                <div className="budget-title">
                    <Wallet size={20} />
                    Monthly Budget
                </div>
                {!isEditing && (
                    <button className="edit-budget-btn" onClick={() => setIsEditing(true)}>
                        <Edit2 size={16} />
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="budget-input-container">
                    <input
                        type="number"
                        className="budget-input"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        placeholder="Set Monthly Budget"
                        autoFocus
                    />
                    <button className="save-btn" onClick={handleSave}>Save</button>
                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            ) : (
                <>
                    <div className="budget-info">
                        <span className="budget-amount" style={{ color: statusColor }}>
                            {currency}{currentExpense.toLocaleString()}
                        </span>
                        <span className="budget-limit">
                            / {currency}{budget.toLocaleString()}
                        </span>
                    </div>

                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{
                                width: `${percentage}%`,
                                backgroundColor: statusColor
                            }}
                        />
                    </div>

                    <div className="budget-status" style={{ color: statusColor }}>
                        <StatusIcon size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                        {statusText} ({Math.round(percentage)}%)
                    </div>
                </>
            )}
        </div>
    );
};

export default BudgetCard;
