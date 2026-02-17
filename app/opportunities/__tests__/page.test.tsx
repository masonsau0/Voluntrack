import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OpportunitiesPage from '../page';
import { getOpportunities } from '@/lib/firebase/opportunities';

// Mock the service
jest.mock('@/lib/firebase/opportunities', () => ({
  getOpportunities: jest.fn(),
  ITEMS_PER_PAGE: 1,
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
    (getOpportunities as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

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
    (getOpportunities as jest.Mock).mockImplementation(async (lastVisible) => {
      if (!lastVisible) {
        return {
          opportunities: mockPage1,
          lastVisible: { id: 'doc-1' },
        };
      } else {
        return {
          opportunities: mockPage2,
          lastVisible: { id: 'doc-2' },
        };
      }
    });

    render(<OpportunitiesPage />);

    // Wait for first load
    await waitFor(() => {
      expect(screen.getAllByText(/Opp 1/)[0]).toBeInTheDocument();
    });

    // Click load more
    const loadMoreButton = screen.getByText('Load More Opportunities');
    fireEvent.click(loadMoreButton);

    // Wait for second load
    await waitFor(() => {
      expect(screen.getByText('Opp 2')).toBeInTheDocument();
    });
    // Opp 1 should still be there
    expect(screen.getAllByText(/Opp 1/).length).toBeGreaterThan(0);
  });

  it('displays error message on failure', async () => {
    (getOpportunities as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

    render(<OpportunitiesPage />);

    expect(await screen.findByText('Failed to load opportunities. Please try again.')).toBeInTheDocument();
  });
});

