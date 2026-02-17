import { getOpportunities } from '../opportunities';
import { collection, getDocs, query, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../config';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  orderBy: jest.fn(),
}));

jest.mock('../config', () => ({
  db: {},
}));

const mockCollection = collection as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockQuery = query as jest.Mock;
const mockLimit = limit as jest.Mock;
const mockStartAfter = startAfter as jest.Mock;
const mockOrderBy = orderBy as jest.Mock;

describe('getOpportunities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch initial opportunities successfully', async () => {
    const mockData = [
      { id: '1', title: 'Opp 1' },
      { id: '2', title: 'Opp 2' },
    ];
    
    // Mock snapshot
    const mockSnapshot = {
      docs: mockData.map(d => ({
        id: d.id,
        data: () => d,
      })),
      forEach: (callback: any) => mockSnapshot.docs.forEach(callback),
    };

    mockGetDocs.mockResolvedValue(mockSnapshot);
    mockCollection.mockReturnValue('collection-ref');
    mockQuery.mockReturnValue('query-ref');

    const result = await getOpportunities(null);

    expect(mockCollection).toHaveBeenCalledWith(db, 'opportunities');
    expect(mockQuery).toHaveBeenCalled();
    expect(mockGetDocs).toHaveBeenCalledWith('query-ref');
    expect(result.opportunities).toHaveLength(2);
    expect(result.opportunities[0].id).toBe('1');
    expect(result.lastVisible).toBe(mockSnapshot.docs[1]);
  });

  it('should handle pagination with startAfter', async () => {
    const lastVisible = { id: 'last-doc' } as any;
    
    // Mock snapshot
    const mockSnapshot = {
      docs: [],
      forEach: jest.fn(),
    };

    mockGetDocs.mockResolvedValue(mockSnapshot);
    
    await getOpportunities(lastVisible);

    expect(mockStartAfter).toHaveBeenCalledWith(lastVisible);
  });

  it('should handle empty results', async () => {
     const mockSnapshot = {
      docs: [],
      forEach: jest.fn(),
    };

    mockGetDocs.mockResolvedValue(mockSnapshot);

    const result = await getOpportunities(null);

    expect(result.opportunities).toHaveLength(0);
    expect(result.lastVisible).toBeNull();
  });

  it('should throw error on failure', async () => {
    mockGetDocs.mockRejectedValue(new Error('Firestore error'));

    await expect(getOpportunities(null)).rejects.toThrow('Firestore error');
  });
});
