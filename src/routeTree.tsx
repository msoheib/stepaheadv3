import React from 'react'
import { RootRoute, Route } from '@tanstack/react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
// Remove unused page/component imports
// import PricingPage from './pages/Pricing' 
// import Features1 from '@/components/features-1'

// Remove unused placeholder components
// const SolutionPage = () => <div className="text-center py-20 text-3xl">Solution Page Coming Soon</div>
// const AboutPage = () => <div className="text-center py-20 text-3xl">About Page Coming Soon</div>

const rootRoute = new RootRoute({
  component: Layout,
})

const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home, // This now renders the page with all sections
})

// Remove unused route definitions
/*
const pricingRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage,
})

const featuresRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/features',
  component: Features1,
})

const solutionRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/solution',
  component: SolutionPage,
})

const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
})
*/

// Update routeTree to only include homeRoute
export const routeTree = rootRoute.addChildren([
  homeRoute,
  // pricingRoute, 
  // featuresRoute,
  // solutionRoute,
  // aboutRoute,
]) 