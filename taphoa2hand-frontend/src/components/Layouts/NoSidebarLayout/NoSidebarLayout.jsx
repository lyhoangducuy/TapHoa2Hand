import React from 'react';
import { Header,Footer } from '../Components';
function DefaultLayout({children}) {
    return (  
        <div>
            <Header />
            <div className="container">
                <div className="content">
                    {children}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default DefaultLayout;