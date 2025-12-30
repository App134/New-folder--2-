import React from 'react';
import './SummaryCard.css';

const SummaryCard = ({ title, amount, change, isPositive, icon: Icon, color }) => {
    return (
        <div className="summary-card">
            <div className="card-header">
                <div className={`icon-wrapper ${color}`}>
                    <Icon size={24} />
                </div>
                <div className={`change-badge ${isPositive ? 'positive' : 'negative'}`}>
                    <span>{change}</span>
                </div>
            </div>
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                <p className="card-amount">{amount}</p>
            </div>
        </div>
    );
};

export default SummaryCard;
