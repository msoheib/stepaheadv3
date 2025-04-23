import { RouterProvider } from '@tanstack/react-router'
import { ClerkProvider } from '@clerk/clerk-react'
import { router } from './router'

// Access the environment variable
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const App = () => (
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    {/* Remove the temporary header that was added during debugging */}
    {/* 
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header> 
    */}
    <RouterProvider router={router} />
  </ClerkProvider>
)

export default App
