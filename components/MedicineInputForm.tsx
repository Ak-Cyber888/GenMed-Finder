import React, { useState, useRef } from 'react';

type Composition = {
    ingredient: string;
    strength: string;
};

interface MedicineInputFormProps {
    onSubmit: (data: { name?: string; image?: File; composition?: Composition[]; database: string }) => void;
    isLoading: boolean;
}

type SearchTab = 'name' | 'composition' | 'image';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors ${
            active
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
    >
        {children}
    </button>
);


const MedicineInputForm: React.FC<MedicineInputFormProps> = ({ onSubmit, isLoading }) => {
    const [activeTab, setActiveTab] = useState<SearchTab>('name');

    const [medicineName, setMedicineName] = useState<string>('');
    const [medicineImage, setMedicineImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [compositions, setCompositions] = useState<Composition[]>([{ ingredient: '', strength: '' }]);
    const [searchDatabase, setSearchDatabase] = useState<string>('general');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMedicineImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setMedicineImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCompositionChange = (index: number, field: keyof Composition, value: string) => {
        const newCompositions = [...compositions];
        newCompositions[index][field] = value;
        setCompositions(newCompositions);
    };

    const addCompositionRow = () => {
        setCompositions([...compositions, { ingredient: '', strength: '' }]);
    };

    const removeCompositionRow = (index: number) => {
        const newCompositions = compositions.filter((_, i) => i !== index);
        setCompositions(newCompositions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        switch (activeTab) {
            case 'name':
                if (!medicineName.trim()) {
                    alert("Please enter a medicine name.");
                    return;
                }
                onSubmit({ name: medicineName, database: searchDatabase });
                break;
            case 'image':
                if (!medicineImage) {
                    alert("Please upload an image.");
                    return;
                }
                onSubmit({ image: medicineImage, database: searchDatabase });
                break;
            case 'composition':
                const validCompositions = compositions.filter(c => c.ingredient.trim() && c.strength.trim());
                if (validCompositions.length === 0) {
                     alert("Please enter at least one complete composition.");
                     return;
                }
                onSubmit({ composition: validCompositions, database: searchDatabase });
                break;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full">
            <div className="mb-4 grid grid-cols-3 gap-2 border border-gray-200 bg-gray-50 p-1 rounded-lg">
                <TabButton active={activeTab === 'name'} onClick={() => setActiveTab('name')}>Brand Name</TabButton>
                <TabButton active={activeTab === 'composition'} onClick={() => setActiveTab('composition')}>Composition</TabButton>
                <TabButton active={activeTab === 'image'} onClick={() => setActiveTab('image')}>Image Upload</TabButton>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'name' && (
                    <div className="animate-fade-in">
                        <label htmlFor="medicine-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Enter Medicine Brand Name
                        </label>
                        <input
                            type="text"
                            id="medicine-name"
                            value={medicineName}
                            onChange={(e) => setMedicineName(e.target.value)}
                            placeholder="e.g., Crocin, Dolo 650"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 transition bg-white"
                            disabled={isLoading}
                        />
                    </div>
                )}
                
                {activeTab === 'composition' && (
                    <div className="space-y-3 animate-fade-in">
                        <label className="block text-sm font-medium text-gray-700">
                            Enter Active Ingredients
                        </label>
                        {compositions.map((comp, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g., Paracetamol"
                                    value={comp.ingredient}
                                    onChange={(e) => handleCompositionChange(index, 'ingredient', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                                    disabled={isLoading}
                                />
                                <input
                                    type="text"
                                    placeholder="e.g., 500mg"
                                    value={comp.strength}
                                    onChange={(e) => handleCompositionChange(index, 'strength', e.target.value)}
                                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                                    disabled={isLoading}
                                />
                                {compositions.length > 1 && (
                                    <button type="button" onClick={() => removeCompositionRow(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" disabled={isLoading}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addCompositionRow} className="text-sm font-medium text-cyan-600 hover:text-cyan-800" disabled={isLoading}>
                            + Add Ingredient
                        </button>
                    </div>
                )}


                {activeTab === 'image' && (
                     <div className="animate-fade-in">
                        <label htmlFor="medicine-image" className="block text-sm font-medium text-gray-700 mb-1">
                            Upload a Picture of the Medicine
                        </label>
                        <input
                            type="file"
                            id="medicine-image"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex justify-center items-center px-4 py-2 border border-dashed border-gray-400 rounded-md text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition"
                            disabled={isLoading}
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                             </svg>
                            Select Image
                        </button>
                        {imagePreview && (
                            <div className="mt-4 relative">
                                <img src={imagePreview} alt="Medicine preview" className="w-full max-w-xs mx-auto rounded-md border" />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                                    aria-label="Remove image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                       <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="pt-2">
                    <fieldset className="space-y-2">
                        <legend className="text-sm font-medium text-gray-800">Search Options</legend>
                        <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input id="db-general" name="database" type="radio" value="general" checked={searchDatabase === 'general'} onChange={(e) => setSearchDatabase(e.target.value)} className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-300" disabled={isLoading} />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="db-general" className="font-medium text-gray-700">General Search</label>
                                <p className="text-gray-500">Find generic equivalents from a broad database.</p>
                            </div>
                        </div>
                        <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input id="db-dava" name="database" type="radio" value="dava" checked={searchDatabase === 'dava'} onChange={(e) => setSearchDatabase(e.target.value)} className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-300" disabled={isLoading} />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="db-dava" className="font-medium text-gray-700">Search DAVA INDIA Database</label>
                                <p className="text-gray-500">Find medicines and prices available at DAVA INDIA stores.</p>
                            </div>
                        </div>
                    </fieldset>
                </div>


                <button
                    type="submit"
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    disabled={isLoading}
                >
                    {isLoading ? 'Analyzing...' : 'Find Generic Medicine'}
                </button>
            </form>
        </div>
    );
};

export default MedicineInputForm;