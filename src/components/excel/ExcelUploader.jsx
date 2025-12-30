import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import './ExcelUploader.css';

const ExcelUploader = ({ onDataLoaded }) => {
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setError('');
            parseFile(file);
        }
    };

    const parseFile = (file) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                // Simple heuristic: Assume first row is header, rest is data
                // And we need 2 columns for a chart typically: Label, Value
                if (data.length < 2) {
                    setError('File seems empty or formatted incorrectly.');
                    return;
                }

                const headers = data[0];
                const rows = data.slice(1);

                // Convert to object array for Recharts
                const formattedData = rows.map((row) => {
                    let obj = {};
                    headers.forEach((h, i) => {
                        obj[h] = row[i];
                    });
                    return obj;
                }).filter(row => Object.keys(row).length > 0);

                onDataLoaded(formattedData, headers);

            } catch (err) {
                console.error(err);
                setError('Failed to parse Excel file.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const clearFile = () => {
        setFileName('');
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        onDataLoaded([], []);
    };

    return (
        <div className="excel-uploader">
            {!fileName ? (
                <div
                    className="upload-zone"
                    onClick={() => fileInputRef.current.click()}
                >
                    <Upload size={32} className="upload-icon" />
                    <p>Click to upload Excel file</p>
                    <span>.xlsx, .xls, .csv</span>
                </div>
            ) : (
                <div className="file-info-card">
                    <div className="file-details">
                        <FileSpreadsheet size={24} className="file-icon" />
                        <span className="filename">{fileName}</span>
                    </div>
                    <button onClick={clearFile} className="remove-btn">
                        <X size={20} />
                    </button>
                </div>
            )}

            {error && <p className="error-msg">{error}</p>}

            <input
                type="file"
                accept=".xlsx, .xls, .csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default ExcelUploader;
