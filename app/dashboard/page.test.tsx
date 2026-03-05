import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from './page'
import { useAuth } from '@/contexts/AuthContext'

// Mock Navigation component
jest.mock('@/components/navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/firebase/dashboard', () => ({
  getUserApplications: jest.fn().mockResolvedValue([]),
  getUserSaved: jest.fn().mockResolvedValue([]),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

describe('DashboardPage', () => {
  it('renders loading state initially', () => {
    (useAuth as jest.Mock).mockReturnValue({ userProfile: null, loading: true })
    render(<DashboardPage />)
    expect(screen.getByText(/Welcome back, \.\.\./i)).toBeInTheDocument()
  })

  it('renders dashboard with user data', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      userProfile: { uid: 'test-uid', firstName: 'Test', role: 'volunteer' }, 
      loading: false 
    })
    render(<DashboardPage />)
    await waitFor(() => {
       expect(screen.getByText(/Welcome back, Test/i)).toBeInTheDocument()
    })
  })
})
