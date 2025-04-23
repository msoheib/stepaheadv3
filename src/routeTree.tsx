import React from 'react'
import { RootRoute, Route } from '@tanstack/react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import PricingPage from './pages/Pricing'

// Placeholder components
const FeaturesPage = () => <div className="text-center py-20 text-3xl">Features Page Coming Soon</div>
const SolutionPage = () => <div className="text-center py-20 text-3xl">Solution Page Coming Soon</div>
const AboutPage = () => <div className="text-center py-20 text-3xl">About Page Coming Soon</div>

const rootRoute = new RootRoute({
  component: Layout,
})

const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const pricingRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage,
})

const featuresRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/features',
  component: FeaturesPage,
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

export const routeTree = rootRoute.addChildren([
  homeRoute,
  pricingRoute,
  featuresRoute,
  solutionRoute,
  aboutRoute,
]) 