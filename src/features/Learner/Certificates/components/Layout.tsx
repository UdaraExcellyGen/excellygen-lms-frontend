import React from 'react';
import Sidebar from '../../../../components/Layout/Sidebar/Sidebar/SideBar'; // Adjust the path if needed

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-gradient-to-b from-[#52007C] to-[#34137C]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 p-6">
                {children}
            </div>
        </div>
    );
};

export default Layout;