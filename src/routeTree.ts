import { RootRoute } from '@tanstack/react-router'
import Home from './pages/Home'

const rootRoute = new RootRoute({
  component: Home,
})

export const routeTree = rootRoute 