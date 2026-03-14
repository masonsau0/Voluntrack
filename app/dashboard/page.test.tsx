import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from './page'
import { useAuth } from '@/contexts/AuthContext'
import { getUserApplications } from '@/lib/firebase/dashboard'

// Mock Next.js Image to avoid JSDOM issues with fill/layout props
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) =>
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ''} className={className} />,
}))

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
  updateApplicationStatus: jest.fn().mockResolvedValue(undefined),
  toggleSaveOpportunity: jest.fn().mockResolvedValue(true),
  submitReflection: jest.fn().mockResolvedValue(undefined),
  subscribeToDecisionNotifications: jest.fn(() => () => {}),
}))

jest.mock('@/lib/firebase/student-profiles', () => ({
  getStudentProfile: jest.fn().mockResolvedValue(null),
}))

jest.mock('@/lib/firebase/reports', () => ({
  submitReport: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/pdf-generator', () => ({
  generateVolunteerPDF: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/components/horizontal-progress-tracker', () => ({
  HorizontalProgressTracker: () => <div data-testid="progress-tracker" />,
}))

jest.mock('@/components/calendar-modal', () => ({
  CalendarModal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

const mockAuth = {
  userProfile: { uid: 'test-uid', firstName: 'Test', role: 'volunteer', goalHours: 40 },
  user: { uid: 'test-uid' },
  loading: false,
}

/** Minimal valid UserApplication shape */
const baseApp = {
  id: 'app1',
  userId: 'test-uid',
  opportunityId: 'opp1',
  appliedDate: new Date().toISOString(),
  title: 'Beach Cleanup',
  organization: 'Green Earth',
  location: 'Malibu, CA',
  date: 'Saturday, Jun 1, 2026',
  dateISO: '2026-06-01',
  hours: 3,
  category: 'Environment',
  image: '/icon.svg',
  skills: [],
  updatedAt: null,
}

describe('DashboardPage', () => {
  it('renders loading state initially', () => {
    (useAuth as jest.Mock).mockReturnValue({ userProfile: null, loading: true })
    render(<DashboardPage />)
    expect(screen.getByText(/Welcome back, \.\.\./i)).toBeInTheDocument()
  })

  it('renders dashboard with user data', async () => {
    (useAuth as jest.Mock).mockReturnValue(mockAuth)
    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test/i)).toBeInTheDocument()
    })
  })

  // ── Status Banners ────────────────────────────────────────────────────────

  describe('application detail status banners', () => {
    /**
     * Render the page with a single application, wait for it to appear,
     * then click its title to open the detail modal.
     */
    async function openModal(app: object) {
      (useAuth as jest.Mock).mockReturnValue(mockAuth);
      (getUserApplications as jest.Mock).mockResolvedValue([app])
      render(<DashboardPage />)

      // Use exact role match to avoid matching "View Full Calendar" button
      const viewBtn = await screen.findByRole('button', { name: /^View$/ })
      await userEvent.click(viewBtn)
    }

    it('shows fallback approved banner when no decisionMessage is set', async () => {
      await openModal({ ...baseApp, status: 'approved' })

      await waitFor(() => expect(screen.getByText('Approved!')).toBeInTheDocument())
      expect(screen.getByText(/Congratulations! Your application has been approved/i)).toBeInTheDocument()
    })

    it('shows org decisionMessage in approved banner', async () => {
      await openModal({
        ...baseApp,
        status: 'approved',
        decisionMessage: 'Please arrive 10 minutes early.',
      })

      await waitFor(() => expect(screen.getByText('Approved!')).toBeInTheDocument())
      expect(screen.getByText('Please arrive 10 minutes early.')).toBeInTheDocument()
      expect(screen.queryByText(/Congratulations! Your application has been approved/i)).not.toBeInTheDocument()
    })

    it('shows coordinator contact section when org contact fields are present', async () => {
      await openModal({
        ...baseApp,
        status: 'approved',
        orgContactName: 'Jane Doe',
        orgContactEmail: 'jane@org.com',
        orgContactPhone: '555-9999',
      })

      await waitFor(() => expect(screen.getByText('Approved!')).toBeInTheDocument())
      expect(screen.getByText('Coordinator Contact')).toBeInTheDocument()
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@org.com')).toBeInTheDocument()
      expect(screen.getByText('555-9999')).toBeInTheDocument()
    })

    it('does not show coordinator section when no org contact fields are set', async () => {
      await openModal({ ...baseApp, status: 'approved' })

      await waitFor(() => expect(screen.getByText('Approved!')).toBeInTheDocument())
      expect(screen.queryByText('Coordinator Contact')).not.toBeInTheDocument()
    })

    it('shows fallback denied banner when no decisionMessage is set', async () => {
      await openModal({ ...baseApp, status: 'denied' })

      // The fallback text is unique — use it as the modal-open signal
      await waitFor(() =>
        expect(screen.getByText(/Unfortunately your application was not approved/i)).toBeInTheDocument()
      )
      // The banner heading also appears (alongside the badge in the list; both are acceptable)
      expect(screen.getAllByText('Not Approved').length).toBeGreaterThanOrEqual(1)
    })

    it('shows org decisionMessage in denied banner', async () => {
      await openModal({
        ...baseApp,
        status: 'denied',
        decisionMessage: 'Thank you for applying — not a fit this time.',
      })

      await waitFor(() =>
        expect(screen.getByText('Thank you for applying — not a fit this time.')).toBeInTheDocument()
      )
      expect(screen.queryByText(/Unfortunately your application was not approved/i)).not.toBeInTheDocument()
    })

    it('does not show approved banner for denied applications', async () => {
      await openModal({ ...baseApp, status: 'denied' })

      // Fallback text confirms the denied banner is rendered in the modal
      await waitFor(() =>
        expect(screen.getByText(/Unfortunately your application was not approved/i)).toBeInTheDocument()
      )
      expect(screen.queryByText('Approved!')).not.toBeInTheDocument()
    })

    it('does not show denied banner for approved applications', async () => {
      await openModal({ ...baseApp, status: 'approved' })

      await waitFor(() => expect(screen.getByText('Approved!')).toBeInTheDocument())
      expect(screen.queryByText('Not Approved')).not.toBeInTheDocument()
    })
  })
})
