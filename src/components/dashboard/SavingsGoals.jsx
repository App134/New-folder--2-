import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Target, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import './SavingsGoals.css';

const SavingsGoals = () => {
    const { savingsGoals, addGoal, deleteGoal, updateGoalAmount, currency } = useData();
    const [isAdding, setIsAdding] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '' });
    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newGoal.name || !newGoal.targetAmount) return;

        await addGoal({
            name: newGoal.name,
            targetAmount: Number(newGoal.targetAmount)
        });
        setIsAdding(false);
        setNewGoal({ name: '', targetAmount: '' });
    };

    const handleUpdate = async (id) => {
        if (!editAmount) return;
        await updateGoalAmount(id, editAmount);
        setEditingId(null);
        setEditAmount('');
    };

    return (
        <div className="savings-goals-container">
            <div className="goals-header">
                <div className="goals-title">
                    <Target size={20} />
                    Savings Goals
                </div>
                {!isAdding && (
                    <button className="add-goal-btn" onClick={() => setIsAdding(true)}>
                        <Plus size={20} />
                    </button>
                )}
            </div>

            {isAdding && (
                <form className="add-goal-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Goal Name (e.g., Vacation)"
                        className="form-input"
                        value={newGoal.name}
                        onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                        autoFocus
                    />
                    <input
                        type="number"
                        placeholder="Target Amount"
                        className="form-input"
                        value={newGoal.targetAmount}
                        onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    />
                    <div className="form-actions">
                        <button type="submit" className="save-btn">Add Goal</button>
                        <button type="button" className="cancel-btn" onClick={() => setIsAdding(false)}>Cancel</button>
                    </div>
                </form>
            )}

            <div className="goals-list">
                {savingsGoals.length === 0 && !isAdding && (
                    <div className="empty-goals">No savings goals yet. Add one to start tracking!</div>
                )}

                {savingsGoals.map(goal => {
                    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

                    return (
                        <div key={goal.id} className="goal-item">
                            <div className="goal-info">
                                <span className="goal-name">{goal.name}</span>
                                <div className="goal-actions">
                                    {editingId === goal.id ? (
                                        <>
                                            <button
                                                className="goal-action-btn"
                                                onClick={() => handleUpdate(goal.id)}
                                                style={{ color: '#10b981' }}
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                className="goal-action-btn"
                                                onClick={() => setEditingId(null)}
                                                style={{ color: '#ef4444' }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="goal-action-btn" onClick={() => {
                                                setEditingId(goal.id);
                                                setEditAmount(goal.currentAmount);
                                            }}>
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="goal-action-btn" onClick={() => deleteGoal(goal.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingId === goal.id ? (
                                <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Saved:</span>
                                    <input
                                        type="number"
                                        className="form-input"
                                        style={{ padding: '0.25rem', fontSize: '0.9rem', width: '100px' }}
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="goal-amounts">
                                    {currency}{goal.currentAmount.toLocaleString()} / {currency}{goal.targetAmount.toLocaleString()}
                                </div>
                            )}

                            <div className="goal-progress-bg">
                                <div
                                    className="goal-progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SavingsGoals;
