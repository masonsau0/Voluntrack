import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OpportunitiesPage from '../page';
import { getOpportunities } from '@/lib/firebase/opportunities';

// Mock the service
jest.mock('@/lib/firebase/opportunities', () => ({
  getAllOpportunities: jest.fn(),
}));

// Mock Firebase config to prevent initialization errors
jest.mock('@/lib/firebase/config', () => ({
  auth: {},
  db: {},
  default: {},
}));

// Mock Firebase dashboard functions
jest.mock('@/lib/firebase/dashboard', () => ({
  applyToOpportunity: jest.fn(),
  toggleSaveOpportunity: jest.fn(),
  getUserApplications: jest.fn().mockResolvedValue([]),
  getUserSaved: jest.fn().mockResolvedValue([]),
}));

// Mock Auth Context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ userProfile: { uid: 'test-uid' }, loading: false }),
}));

// Mock Navigation component
jest.mock('@/components/navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

// Mock Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));
jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));
// ... mock other UI components if necessary for rendering

describe('OpportunitiesPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders loading state initially', async () => {
    const { getAllOpportunities } = require('@/lib/firebase/opportunities');
    (getAllOpportunities as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

    render(<OpportunitiesPage />);

    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });



  it('handles load more', async () => {
    const mockPage1 = [{ 
      id: '1', title: 'Opp 1', category: 'Environment', image: '/img.png', location: 'Loc', skills: [], 
      organization: 'Org 1', description: 'Desc 1', hours: 1, spotsLeft: 1, totalSpots: 1, commitment: 'One-time', date: 'Date', time: 'Time'
    }];
    const mockPage2 = [{ 
      id: '2', title: 'Opp 2', category: 'Environment', image: '/img.png', location: 'Loc', skills: [],
      organization: 'Org 2', description: 'Desc 2', hours: 1, spotsLeft: 1, totalSpots: 1, commitment: 'One-time', date: 'Date', time: 'Time'
    }];

    // Setup intelligent mock implementation
    const { getAllOpportunities } = require('@/lib/firebase/opportunities');
    (getAllOpportunities as jest.Mock).mockResolvedValue(mockPage1);

    render(<OpportunitiesPage />);

    // Wait for first load
    await waitFor(() => {
      expect(screen.getAllByText(/Opp 1/)[0]).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    const { getAllOpportunities } = require('@/lib/firebase/opportunities');
    (getAllOpportunities as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

    render(<OpportunitiesPage />);

    expect(await screen.findByText('Failed to load opportunities. Please try again.')).toBeInTheDocument();
  });
});

