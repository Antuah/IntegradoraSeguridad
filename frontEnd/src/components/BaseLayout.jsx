import React from 'react';
import Footer from './Footer';
import Navbar from './Navbar';

const BaseLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow p-4 bg-gray-100">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default BaseLayout;
