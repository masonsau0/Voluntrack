import { submitExternalOpportunity, BADGE_MILESTONES } from '../dashboard';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
}));

jest.mock('../config', () => ({
  db: {},
}));

const mockDoc = doc as jest.Mock;
const mockSetDoc = setDoc as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockUpdateDoc = updateDoc as jest.Mock;

describe('submitExternalOpportunity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockImplementation((dbInstance, collectionPath, docId) => `${collectionPath}/${docId}`);
    
    // Default mock for profile
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        hoursCompleted: 5,
        badges: []
      }),
    });
  });

  const validData = {
    title: 'Test External Opp',
    organization: 'Test Org',
    date: '2026-05-15',
    hours: 5,
    category: 'Community',
    reflection: 'Learned a lot today!',
    contactName: 'Jane Doe',
    contactEmail: 'jane@example.com',
  };

  it('should successfully submit an external opportunity and update profile hours', async () => {
    await submitExternalOpportunity('user-123', validData);

    // Verify application setDoc
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.stringContaining('user_applications/user-123_ext_'),
      expect.objectContaining({
        title: 'Test External Opp',
        status: 'completed',
        hours: 5,
        isExternal: true,
      })
    );

    // Verify getting profile
    expect(mockGetDoc).toHaveBeenCalledWith('student_profiles/user-123');

    // Verify updating profile hours (5 previous + 5 new = 10)
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      'student_profiles/user-123',
      expect.objectContaining({
        hoursCompleted: 10,
        badges: expect.arrayContaining(['helping-hand']), // 10 hours triggers helping-hand
      })
    );
  });

  it('should grant multiple badges if milestones are crossed', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        hoursCompleted: 0,
        badges: []
      }),
    });

    const hugeData = { ...validData, hours: 50 }; // Should hit all badges
    await submitExternalOpportunity('user-123', hugeData);

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      'student_profiles/user-123',
      expect.objectContaining({
        hoursCompleted: 50,
        badges: expect.arrayContaining(['first-steps', 'helping-hand', 'goal-setter']),
      })
    );
  });

  it('should not update profile if profile document does not exist', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => false,
    });

    await submitExternalOpportunity('user-abc', validData);

    // App is still submitted
    expect(mockSetDoc).toHaveBeenCalled();
    
    // But updateDoc should not be called
    expect(mockUpdateDoc).not.toHaveBeenCalled();
  });
});
