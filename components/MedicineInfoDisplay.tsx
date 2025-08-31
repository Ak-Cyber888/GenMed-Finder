import React, { useState, useMemo } from 'react';
import type { MedicineInfo, Store } from '../types';

interface MedicineInfoDisplayProps {
    data: MedicineInfo;
    searchContext: string;
    onSave: (medicine: MedicineInfo) => void;
    isSaved: boolean;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode; }> = ({ title, children, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center mb-2">
            <div className="text-cyan-600 mr-3">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="text-gray-600 pl-8">{children}</div>
    </div>
);

const indianCapitals: Record<string, string> = {
    'Andhra Pradesh': 'Amaravati',
    'Arunachal Pradesh': 'Itanagar',
    'Assam': 'Dispur',
    'Bihar': 'Patna',
    'Chhattisgarh': 'Raipur',
    'Goa': 'Panaji',
    'Gujarat': 'Gandhinagar',
    'Haryana': 'Chandigarh',
    'Himachal Pradesh': 'Shimla',
    'Jharkhand': 'Ranchi',
    'Karnataka': 'Bengaluru',
    'Kerala': 'Thiruvananthapuram',
    'Madhya Pradesh': 'Bhopal',
    'Maharashtra': 'Mumbai',
    'Manipur': 'Imphal',
    'Meghalaya': 'Shillong',
    'Mizoram': 'Aizawl',
    'Nagaland': 'Kohima',
    'Odisha': 'Bhubaneswar',
    'Punjab': 'Chandigarh',
    'Rajasthan': 'Jaipur',
    'Sikkim': 'Gangtok',
    'Tamil Nadu': 'Chennai',
    'Telangana': 'Hyderabad',
    'Tripura': 'Agartala',
    'Uttar Pradesh': 'Lucknow',
    'Uttarakhand': 'Dehradun',
    'West Bengal': 'Kolkata'
};

const StoreLocator: React.FC<{ stores: Store[] }> = ({ stores }) => {
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const indianStates = useMemo(() => [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
        'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
        'Uttarakhand', 'West Bengal'
    ].sort(), []);

    const states = indianStates;

    const cities = useMemo(() => {
        if (!selectedState) return [];
        
        const capital = indianCapitals[selectedState];
        const citiesFromStores = stores
            .filter(s => s.state === selectedState)
            .map(s => s.city);
        
        const allCities = new Set(citiesFromStores);
        if (capital) {
            allCities.add(capital);
        }

        return [...allCities].sort();
    }, [stores, selectedState]);
    
    const filteredStores = useMemo(() => {
        return stores.filter(store => {
            const stateMatch = !selectedState || store.state === selectedState;
            const cityMatch = !selectedCity || store.city === selectedCity;
            return stateMatch && cityMatch;
        });
    }, [stores, selectedState, selectedCity]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
                <div>
                    <label htmlFor="state-filter" className="block text-sm font-medium text-gray-700">State</label>
                    <select id="state-filter" value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedCity(''); }} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">
                        <option value="">All States</option>
                        {states.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="city-filter" className="block text-sm font-medium text-gray-700">City</label>
                    <select id="city-filter" value={selectedCity} onChange={e => setSelectedCity(e.target.value)} disabled={!selectedState} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md disabled:bg-gray-200">
                        <option value="">All Cities</option>
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStores.map((store, index) => (
                    <div key={index} className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <p className="font-bold text-cyan-700">{store.name}</p>
                        <p className="text-sm text-gray-600">{store.address}</p>
                        <p className="text-sm text-gray-500 mt-1">{store.city}, {store.state}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const MedicineInfoDisplay: React.FC<MedicineInfoDisplayProps> = ({ data, searchContext, onSave, isSaved }) => {
    const isSpecialSearch = searchContext === 'dava';
    const storeChainName = 'DAVA INDIA';

    const priceTitle = isSpecialSearch ? `Price at ${storeChainName} (Approx. in INR)` : "Price Comparison (Approx. in INR)";
    const storeTitle = isSpecialSearch ? `${storeChainName} Store Availability` : "Fictional Store Availability";


    return (
        <div className="w-full space-y-6 animate-fade-in">
            <div className="relative text-center p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                 <button
                    onClick={() => onSave(data)}
                    disabled={isSaved}
                    className="absolute top-4 right-4 flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {isSaved ? 'Saved' : 'Save Medicine'}
                </button>
                <h2 className="text-sm font-medium text-gray-500 tracking-wider uppercase">Brand Name</h2>
                <p className="text-4xl font-bold text-gray-800 mt-1">{data.brandName}</p>
                <div className="mt-4 text-sm font-medium text-gray-500 tracking-wider uppercase">Generic Name</div>
                <p className="text-2xl font-semibold text-cyan-700 mt-1">{data.genericName}</p>
                 {data.publicName && (
                    <>
                        <div className="mt-3 text-sm font-medium text-gray-500 tracking-wider uppercase">Common Generic Brand</div>
                        <p className="text-xl font-medium text-gray-700">{data.publicName}</p>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title="Composition" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}>
                    <ul className="list-disc list-inside">
                       {data.composition.map((c, i) => <li key={i}>{c.ingredient} ({c.strength})</li>)}
                    </ul>
                </InfoCard>
                <InfoCard title="Dosage & Timing" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                    <p><strong>Dosage:</strong> {data.dosage}</p>
                    <p><strong>Timing:</strong> {data.timing}</p>
                </InfoCard>
            </div>
            
             <InfoCard title={priceTitle} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                {isSpecialSearch ? (
                     <div className="text-center">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{storeChainName} Price</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">{data.genericPrice}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Brand Name</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{data.brandPrice}</p>
                        </div>
                        <div className="border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4 border-gray-200">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Generic</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{data.genericPrice}</p>
                        </div>
                    </div>
                )}
            </InfoCard>

            <div>
                 <h3 className="text-xl font-semibold text-gray-800 mb-3">{storeTitle}</h3>
                 <StoreLocator stores={data.availableAt} />
            </div>

        </div>
    );
};

export default MedicineInfoDisplay;