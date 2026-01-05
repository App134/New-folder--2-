import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.5rem',
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                zIndex: 10
            }}
            className="back-button"
        >
            <ArrowLeft size={24} />
            <span>Back</span>
        </button>
    );
};

export default BackButton;
