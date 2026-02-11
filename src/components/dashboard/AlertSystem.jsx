import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, XCircle, CreditCard, TrendingDown } from 'lucide-react';
import './AlertSystem.css';

const AlertSystem = () => {
    const { alerts } = useData();
    const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

    const handleDismiss = (id) => {
        setDismissedAlerts(prev => new Set(prev).add(id));
    };

    const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

    if (visibleAlerts.length === 0) return null;

    const getIcon = (type, id) => {
        if (type === 'danger') return XCircle;
        if (id.includes('budget')) return AlertTriangle;
        if (id.includes('savings')) return TrendingDown;
        if (id.includes('cc')) return CreditCard;
        return Info;
    };

    return (
        <div className="alert-system-container">
            <AnimatePresence>
                {visibleAlerts.map(alert => {
                    const Icon = getIcon(alert.type, alert.id);
                    return (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className={`alert-card alert-${alert.type}`}
                        >
                            <div className="alert-icon-wrapper">
                                <Icon size={20} />
                            </div>
                            <div className="alert-content">
                                <h4 className="alert-title">{alert.title}</h4>
                                <p className="alert-message">{alert.message}</p>
                            </div>
                            <button className="alert-dismiss" onClick={() => handleDismiss(alert.id)}>
                                <XCircle size={18} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default AlertSystem;
