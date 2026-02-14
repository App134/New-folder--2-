import React from 'react';
import { Edit, FileSpreadsheet, Smartphone } from 'lucide-react';

const SourceBadge = ({ source }) => {
    const config = {
        'manual': {
            label: 'Manual',
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-400',
            borderColor: 'border-blue-500/20',
            icon: Edit
        },
        'google-sheets': {
            label: 'Imported',
            bgColor: 'bg-green-500/10',
            textColor: 'text-green-400',
            borderColor: 'border-green-500/20',
            icon: FileSpreadsheet
        },
        'phonepe': {
            label: 'PhonePe',
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-400',
            borderColor: 'border-purple-500/20',
            icon: Smartphone
        }
    };

    const sourceConfig = config[source] || config['manual'];
    const Icon = sourceConfig.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${sourceConfig.bgColor} ${sourceConfig.textColor} ${sourceConfig.borderColor}`}
        >
            <Icon size={12} />
            {sourceConfig.label}
        </span>
    );
};

export default SourceBadge;
