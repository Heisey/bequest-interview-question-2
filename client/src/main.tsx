import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Query from '@tanstack/react-query'
import App from './App'

const client = new Query.QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Query.QueryClientProvider client={client}>
      <App />
    </Query.QueryClientProvider>
  </StrictMode>,
)
