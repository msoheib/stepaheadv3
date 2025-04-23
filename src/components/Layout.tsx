import React from 'react'
import { Outlet } from '@tanstack/react-router'
import Header from './hero5-header'
import Footer from './footer'

const Layout: React.FC = () => (
  <div className="min-h-screen flex flex-col">
    <Header />

    <main className="flex-1 w-full">
      <Outlet />
    </main>
   <Footer />

  </div>
)

export default Layout 