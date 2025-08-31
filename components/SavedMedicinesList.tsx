import React from 'react';
import type { MedicineInfo } from '../types';

interface SavedMedicinesListProps {
    medicines: MedicineInfo[];
    onRemove: (index: number) => void;
    onView: (medicine: MedicineInfo) => void;
    onClear: () => void;
}

const SavedMedicinesList: React.FC<SavedMedicinesListProps> = ({ medicines, onRemove, onView, onClear }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">My Saved Medicines</h3>
                <button 
                    onClick={onClear}
                    className="text-sm font-medium text-red-600 hover:text-red-800 transition"
                >
                    Clear All
                </button>
            </div>
            <ul className="space-y-3">
                {medicines.map((med, index) => (
                    <li 
                        key={`${med.brandName}-${index}`}
                        className="p-3 bg-slate-50 border border-gray-200 rounded-lg flex items-center justify-between"
                    >
                        <div>
                            <p className="font-semibold text-gray-700">{med.brandName}</p>
                            <p className="text-sm text-gray-500">{med.genericName}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <button 
                                onClick={() => onView(med)} 
                                className="px-3 py-1 text-sm font-medium text-cyan-700 bg-cyan-100 hover:bg-cyan-200 rounded-md transition"
                            >
                                View
                            </button>
                            <button 
                                onClick={() => onRemove(index)} 
                                className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                                aria-label="Remove medicine"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SavedMedicinesList;
