import React from 'react';


const SummaryCard = ({ title, amount, change, isPositive, icon: Icon, color }) => {
    // Map colors to semantic theme colors
    const colorClasses = {
        blue: 'bg-info/10 text-info',
        red: 'bg-danger/10 text-danger',
        green: 'bg-success/10 text-success',
        orange: 'bg-warning/10 text-warning',
        purple: 'bg-accent/10 text-accent'
    };

    const iconBgColor = colorClasses[color] || colorClasses.blue;

    return (
        <div className="glass-panel p-6 rounded-[24px] flex flex-col gap-4 glass-card-hover relative overflow-hidden group">
            {/* Subtle glow effect on hover */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${color === 'purple' ? 'accent' : 'primary'}/5 rounded-full blur-2xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-${color === 'purple' ? 'accent' : 'primary'}/10`} />

            <div className="flex justify-between items-start relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBgColor} border border-white/5`}>
                    <Icon size={24} />
                </div>
                <div className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${isPositive ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                    <span>{change}</span>
                </div>
            </div>
            <div className="flex flex-col gap-1 relative z-10">
                <h3 className="text-sm text-muted font-medium tracking-wide uppercase">{title}</h3>
                <p className="text-2xl font-bold text-primary-foreground tracking-tight">{amount}</p>
            </div>
        </div>
    );
};

export default SummaryCard;
