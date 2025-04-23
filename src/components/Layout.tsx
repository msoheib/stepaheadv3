import React from 'react'
import Header from './hero5-header'
import Footer from './footer'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 flex flex-col items-center justify-center w-full">
      {children}
    </main>
   <Footer />

  </div>
)

export default Layout 