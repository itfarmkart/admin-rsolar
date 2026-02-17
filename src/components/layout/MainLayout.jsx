
import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: 'var(--spacing-xl)', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
