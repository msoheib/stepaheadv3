import React from 'react'
import HeroSection from '@/components/hero-section' 
import Features1 from '@/components/features-1'
import Pricing from '@/components/pricing'

const Home: React.FC = () => (
    <React.Fragment>
        <HeroSection />
        <Features1 />
        <Pricing />
    </React.Fragment>
)

export default Home 