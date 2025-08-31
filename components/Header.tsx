
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm4 2a1 1 0 00-1 1v1a1 1 0 002 0V6a1 1 0 00-1-1zM5 9a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                        Generic Medicine Finder
                    </h1>
                </div>
            </div>
        </header>
    );
};

export default Header;
