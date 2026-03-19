import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-surface border-t border-gray-200 mt-auto py-8">
            <div className="container text-center">
                <p className="text-secondary mb-2" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                    &copy; {new Date().getFullYear()} Digital Academic Repository. All rights reserved.
                </p>
                <div className="flex justify-center flex-wrap gap-4 text-sm text-secondary">
                    <a href="#" className="hover:text-primary">Privacy Policy</a>
                    <a href="#" className="hover:text-primary">Terms of Service</a>
                    <a href="#" className="hover:text-primary">Contact Support</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
