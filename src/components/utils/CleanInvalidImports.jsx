import React, { useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Trash2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const CleanInvalidImports = () => {
    const { currentUser } = useAuth();
    const [status, setStatus] = useState('idle'); // idle, scanning, cleaning, done
    const [invalidDocs, setInvalidDocs] = useState([]);
    const [selectedDocs, setSelectedDocs] = useState([]); // Track selected documents
    const [deletedCount, setDeletedCount] = useState(0);
    const [error, setError] = useState(null);

    const scanForInvalidDocs = async () => {
        if (!currentUser) {
            setError('User not authenticated');
            return;
        }

        setStatus('scanning');
        setError(null);
        setInvalidDocs([]);
        setSelectedDocs([]);

        try {
            const dataRef = collection(db, 'users', currentUser.uid, 'financial_data');
            const snapshot = await getDocs(dataRef);

            const invalid = [];
            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                // Check if the document has an 'id' field that starts with 'sheet-'
                if (data.id && typeof data.id === 'string' && data.id.startsWith('sheet-')) {
                    invalid.push({
                        firestoreId: docSnap.id, // Real Firestore ID
                        tempId: data.id, // Temporary 'sheet-' ID
                        description: data.description || data.category || 'Unknown',
                        createdAt: data.createdAt,
                        income: data.income || 0,
                        expense: data.expense || 0
                    });
                }
            });

            setInvalidDocs(invalid);
            setSelectedDocs(invalid.map(doc => doc.firestoreId)); // Select all by default
            setStatus('idle');
        } catch (err) {
            console.error('Error scanning documents:', err);
            setError('Failed to scan documents: ' + err.message);
            setStatus('idle');
        }
    };

    const toggleSelection = (firestoreId) => {
        setSelectedDocs(prev =>
            prev.includes(firestoreId)
                ? prev.filter(id => id !== firestoreId)
                : [...prev, firestoreId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedDocs.length === invalidDocs.length) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(invalidDocs.map(doc => doc.firestoreId));
        }
    };

    const cleanInvalidDocs = async () => {
        if (!currentUser || selectedDocs.length === 0) return;

        setStatus('cleaning');
        setError(null);
        setDeletedCount(0);

        try {
            let count = 0;
            for (const firestoreId of selectedDocs) {
                await deleteDoc(doc(db, 'users', currentUser.uid, 'financial_data', firestoreId));
                count++;
                setDeletedCount(count);
            }

            setStatus('done');
            setInvalidDocs([]);
            setSelectedDocs([]);
        } catch (err) {
            console.error('Error cleaning documents:', err);
            setError('Failed to clean documents: ' + err.message);
            setStatus('idle');
        }
    };

    return (
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-white/10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <AlertTriangle className="text-warning" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-primary-foreground">Clean Invalid Imports</h2>
                    <p className="text-sm text-muted">Remove old imported transactions with temporary IDs</p>
                </div>
            </div>

            {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-4">
                    <p className="text-danger text-sm">{error}</p>
                </div>
            )}

            {status === 'idle' && invalidDocs.length === 0 && (
                <div className="space-y-4">
                    <div className="bg-info/10 border border-info/20 rounded-xl p-4">
                        <p className="text-info text-sm">
                            This tool will scan your database for transactions imported from Google Sheets that have invalid temporary IDs (starting with "sheet-"). These transactions cannot be deleted normally.
                        </p>
                    </div>
                    <button
                        onClick={scanForInvalidDocs}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={20} />
                        Scan for Invalid Transactions
                    </button>
                </div>
            )}

            {status === 'scanning' && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="ml-3 text-muted">Scanning database...</span>
                </div>
            )}

            {status === 'idle' && invalidDocs.length > 0 && (
                <div className="space-y-4">
                    <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                        <p className="text-warning font-semibold mb-2">
                            Found {invalidDocs.length} invalid transaction{invalidDocs.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-muted">
                            Select the transactions you want to delete. These have temporary IDs and cannot be deleted normally.
                        </p>
                    </div>

                    {/* Select All Checkbox */}
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-white/10">
                        <input
                            type="checkbox"
                            checked={selectedDocs.length === invalidDocs.length}
                            onChange={toggleSelectAll}
                            className="w-5 h-5 rounded border-white/20 bg-background-card text-primary focus:ring-2 focus:ring-primary/50 cursor-pointer"
                        />
                        <label className="text-sm font-medium text-primary-foreground cursor-pointer" onClick={toggleSelectAll}>
                            Select All ({selectedDocs.length} of {invalidDocs.length} selected)
                        </label>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 bg-background/50 rounded-xl p-4">
                        {invalidDocs.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedDocs.includes(doc.firestoreId)}
                                    onChange={() => toggleSelection(doc.firestoreId)}
                                    className="w-5 h-5 rounded border-white/20 bg-background-card text-primary focus:ring-2 focus:ring-primary/50 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-primary-foreground">{doc.description}</p>
                                    <p className="text-xs text-muted">ID: {doc.tempId}</p>
                                </div>
                                <div className="text-right">
                                    {doc.income > 0 && <p className="text-xs text-success">+${doc.income}</p>}
                                    {doc.expense > 0 && <p className="text-xs text-danger">-${doc.expense}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={cleanInvalidDocs}
                        disabled={selectedDocs.length === 0}
                        className="w-full bg-danger hover:bg-danger/90 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 size={20} />
                        Delete {selectedDocs.length} Selected Transaction{selectedDocs.length !== 1 ? 's' : ''}
                    </button>
                </div>
            )}

            {status === 'cleaning' && (
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="animate-spin text-danger mb-4" size={32} />
                    <p className="text-muted">Deleting selected transactions...</p>
                    <p className="text-sm text-muted mt-2">{deletedCount} / {selectedDocs.length} deleted</p>
                </div>
            )}

            {status === 'done' && (
                <div className="space-y-4">
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle className="text-success" size={24} />
                        <div>
                            <p className="text-success font-semibold">Cleanup Complete!</p>
                            <p className="text-sm text-muted">Successfully deleted {deletedCount} invalid transaction{deletedCount !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="bg-info/10 border border-info/20 rounded-xl p-4">
                        <p className="text-info text-sm">
                            ✅ You can now re-import your transactions from Google Sheets. New imports will use proper Firestore IDs and can be deleted normally.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setStatus('idle');
                            setDeletedCount(0);
                        }}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                        Scan Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default CleanInvalidImports;
