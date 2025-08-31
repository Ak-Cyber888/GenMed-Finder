import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import MedicineInputForm from './components/MedicineInputForm';
import MedicineInfoDisplay from './components/MedicineInfoDisplay';
import SavedMedicinesList from './components/SavedMedicinesList';
import { getMedicineInfo } from './services/geminiService';
import { fileToGenerativePart } from './utils/fileUtils';
import type { MedicineInfo } from './types';

type Composition = {
    ingredient: string;
    strength: string;
};

interface SearchData {
    name?: string;
    image?: File;
    composition?: Composition[];
    database: string;
}

const AppDescription: React.FC = () => (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-cyan-700 mb-2">Find Affordable Generic Medicines Instantly! 💊</h2>
        <p className="text-gray-600 text-center mb-4">
            Tired of paying high prices for branded medicines? With <strong>Generic Medicine Finder</strong>, you can quickly discover generic alternatives to your current medicines and save money without compromising on quality.
        </p>
        
        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Our app helps you find generic medicines in 3 easy ways:</h3>
        <ul className="list-none space-y-2 text-gray-700">
            <li><span className="mr-2">1️⃣</span> <strong>Upload a Picture</strong> – Just click and upload your medicine strip/bill to get instant generic matches.</li>
            <li><span className="mr-2">2️⃣</span> <strong>Search by Medicine Name</strong> – Enter the brand name and get generic substitutes in seconds.</li>
            <li><span className="mr-2">3️⃣</span> <strong>Search by Composition</strong> – Know the formula? Enter the composition to explore all available generics.</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">🔑 Key Features:</h3>
        <ul className="list-none space-y-2 text-gray-700">
            <li><span className="text-green-500 mr-2">✅</span> Find cost-effective generic alternatives for branded medicines</li>
            <li><span className="text-green-500 mr-2">✅</span> Save up to 70% on medical expenses</li>
            <li><span className="text-green-500 mr-2">✅</span> Smart AI-powered search for accurate results</li>
            <li><span className="text-green-500 mr-2">✅</span> Simple, fast & user-friendly design for everyone</li>
            <li><span className="text-green-500 mr-2">✅</span> Regularly updated drug database</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">🌍 Why Choose Generic Medicine Finder?</h3>
        <p className="text-gray-700">
            Healthcare should be affordable for all. This app empowers you to make smarter, more cost-effective choices by showing you trusted and equivalent generic medicines that work the same as expensive branded ones.
        </p>

        <p className="text-center font-bold text-cyan-600 mt-6 text-lg">
            💡 Save Money. Stay Healthy. Live Better.
        </p>
        
        <p className="text-center text-gray-500 mt-4 text-sm">
            Start finding affordable medicine alternatives in seconds using the form above!
        </p>
    </div>
);


const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p className="text-gray-600">AI is analyzing your request...</p>
    </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);

const Disclaimer: React.FC = () => (
    <div className="mt-6 bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md" role="alert">
        <p className="font-bold">Disclaimer</p>
        <p>This tool is powered by AI and is for informational purposes only. It is not a substitute for professional medical advice. Always consult with a qualified healthcare provider before making any decisions about your health or medications.</p>
    </div>
);

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);
    const [searchContext, setSearchContext] = useState<string>('general');
    const [savedMedicines, setSavedMedicines] = useState<MedicineInfo[]>(() => {
        try {
            const items = window.localStorage.getItem('savedMedicines');
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('savedMedicines', JSON.stringify(savedMedicines));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }, [savedMedicines]);


    const handleSubmit = useCallback(async (data: SearchData) => {
        setIsLoading(true);
        setError(null);
        setMedicineInfo(null);
        setSearchContext(data.database);

        try {
            let imagePart = null;
            let prompt = "";

            if (data.image) {
                imagePart = await fileToGenerativePart(data.image);
                prompt = "Analyze the provided image of the medicine packaging.";
            } else if (data.name) {
                prompt = `The medicine name is: "${data.name}". Find its generic equivalent and details.`;
            } else if (data.composition) {
                const compositionString = data.composition.map(c => `${c.ingredient} ${c.strength}`).join(', ');
                prompt = `A user has provided the following composition: ${compositionString}. Your task is to:
1. Identify a common, publicly available medicine brand name in India that matches this exact composition.
2. For the medicine you identify, fill out the provided JSON schema.
- The 'brandName' in the schema should be the common brand you found.
- The 'genericName' should be the list of active ingredients (e.g., 'Paracetamol & Caffeine').
- The 'publicName' can be the same as the 'brandName' or another common alternative.
- The 'brandPrice' and 'genericPrice' in the schema should be treated as the same, representing the typical market price for this generic medicine.`;
            } else {
                 throw new Error("No valid input provided.");
            }
            
            let specialInstruction = "";
            if (data.database === 'dava') {
                specialInstruction = `
CRITICAL INSTRUCTION: The user wants to search the DAVA INDIA generic pharmacy database.
1.  Your primary goal is to find a medicine brand available at DAVA INDIA that matches the user's query.
2.  The 'brandName', 'publicName', and 'genericName' should reflect the product sold at DAVA INDIA.
3.  The 'brandPrice' and 'genericPrice' must be the specific price for that product at DAVA INDIA. If you cannot find a specific price, provide a realistic estimate and label it clearly. These two price fields should have the same value.
4.  The 'availableAt' list MUST ONLY contain fictional "Dava India - [City Name]" store locations across various cities in India.`;
            }

            if(specialInstruction) {
                prompt = specialInstruction + "\n\nUser Query Context:\n" + prompt;
            }

            const result = await getMedicineInfo(prompt, imagePart);
            setMedicineInfo(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleSaveMedicine = (medicine: MedicineInfo) => {
        const isAlreadySaved = savedMedicines.some(
            (m) => m.brandName === medicine.brandName && m.genericName === medicine.genericName
        );
        if (!isAlreadySaved) {
            setSavedMedicines(prev => [...prev, medicine]);
        }
    };

    const handleRemoveMedicine = (index: number) => {
        setSavedMedicines(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleClearSaved = () => {
        setSavedMedicines([]);
    }

    const handleViewSavedMedicine = (medicine: MedicineInfo) => {
        setMedicineInfo(medicine);
        // Assuming the saved context is always general, or needs to be stored
        setSearchContext('general'); 
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isInitialState = !isLoading && !error && !medicineInfo;

    return (
        <div className="min-h-screen text-gray-800">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto">
                    <MedicineInputForm onSubmit={handleSubmit} isLoading={isLoading} />
                    
                    {savedMedicines.length > 0 && (
                        <div className="mt-8">
                            <SavedMedicinesList
                                medicines={savedMedicines}
                                onRemove={handleRemoveMedicine}
                                onView={handleViewSavedMedicine}
                                onClear={handleClearSaved}
                             />
                        </div>
                    )}

                    <div className="mt-8">
                        {isLoading && <LoadingSpinner />}
                        {error && <ErrorMessage message={error} />}
                        {medicineInfo && (
                            <>
                                <MedicineInfoDisplay
                                    data={medicineInfo}
                                    searchContext={searchContext}
                                    onSave={handleSaveMedicine}
                                    isSaved={savedMedicines.some(m => m.brandName === medicineInfo.brandName && m.genericName === medicineInfo.genericName)}
                                />
                                <Disclaimer />
                            </>
                        )}
                        {isInitialState && <AppDescription />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;