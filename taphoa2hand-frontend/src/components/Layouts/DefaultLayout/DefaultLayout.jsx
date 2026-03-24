import React from 'react';
import { Header,Footer } from '../Components';
import { Sidebar } from '../Components/Sidebar';
function DefaultLayout({children}) {
    return (  
        <div>
            <Header />
            <div className="container">
                <Sidebar/>
                <div className="content">
                    {children}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default DefaultLayout;