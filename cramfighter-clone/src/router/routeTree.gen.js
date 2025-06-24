import { RootRoute, Route, Router } from '@tanstack/react-router';

// Import page components
import Layout from '../components/Layout';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import SubjectsPage from '../pages/SubjectsPage'; // Import new page
import ResourcesPage from '../pages/ResourcesPage'; // Import new page
import PreferencesPage from '../pages/PreferencesPage'; // Import new page

// Create a root route
const rootRoute = new RootRoute({
  component: Layout, // The Layout component will wrap all child routes
});

import { redirect } from '@tanstack/react-router';
import { supabase } from '../services/supabaseClient'; // Import supabase client

// Create child routes
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          // Optionally, preserve the original intended path to redirect back after login
          redirect: location.href,
        },
      });
    }
    // If there's a session, proceed to load the route
    return {}; // Must return context or undefined/void
  },
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const signupRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
});

// Generic beforeLoad function for protected routes
const protectedRouteBeforeLoad = async ({ location }) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw redirect({
      to: '/login',
      search: { redirect: location.href },
    });
  }
  return {}; // Or router context if needed
};

const subjectsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/subjects',
  component: SubjectsPage,
  beforeLoad: protectedRouteBeforeLoad,
});

const resourcesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/resources',
  component: ResourcesPage,
  beforeLoad: protectedRouteBeforeLoad,
});

const preferencesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/preferences',
  component: PreferencesPage,
  beforeLoad: protectedRouteBeforeLoad,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  subjectsRoute,
  resourcesRoute,
  preferencesRoute
]);

// Create the router instance
export const router = new Router({ routeTree });

// Register things for typesafety
/*
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
*/
