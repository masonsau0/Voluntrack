import { submitExternalOpportunity, updateApplicationStatus, BADGE_MILESTONES } from '../dashboard';
import { doc, setDoc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  addDoc: jest.fn(),
  collection: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
}));

jest.mock('../config', () => ({
  db: {},
}));

const mockDoc = doc as jest.Mock;
const mockSetDoc = setDoc as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockUpdateDoc = updateDoc as jest.Mock;
const mockAddDoc = addDoc as jest.Mock;
const mockCollection = collection as jest.Mock;

describe('updateApplicationStatus', () => {
  const appDocData = {
    status: 'pending',
    title: 'Beach Cleanup',
    hours: 4,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockImplementation((_db: any, col: string, id: string) => `${col}/${id}`);
    mockCollection.mockImplementation((_db: any, col: string) => col);
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => appDocData });
    mockUpdateDoc.mockResolvedValue(undefined);
    mockAddDoc.mockResolvedValue({ id: 'notif-1' });
  });

  it('writes status and updatedAt to the application document', async () => {
    await updateApplicationStatus('u1', 'opp1', 'approved');

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      'user_applications/u1_opp1',
      expect.objectContaining({ status: 'approved', updatedAt: 'mock-timestamp' })
    );
  });

  it('writes decisionMessage when provided', async () => {
    await updateApplicationStatus('u1', 'opp1', 'approved', {
      decisionMessage: 'Welcome aboard!',
    });

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      'user_applications/u1_opp1',
      expect.objectContaining({ decisionMessage: 'Welcome aboard!' })
    );
  });

  it('writes all org contact fields when provided for approval', async () => {
    await updateApplicationStatus('u1', 'opp1', 'approved', {
      orgContactName: 'Jane Doe',
      orgContactEmail: 'jane@org.com',
      orgContactPhone: '555-1234',
    });

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      'user_applications/u1_opp1',
      expect.objectContaining({
        orgContactName: 'Jane Doe',
        orgContactEmail: 'jane@org.com',
        orgContactPhone: '555-1234',
      })
    );
  });

  it('does not write optional fields when options are not provided', async () => {
    await updateApplicationStatus('u1', 'opp1', 'denied');

    const updateArg = mockUpdateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(updateArg).not.toHaveProperty('decisionMessage');
    expect(updateArg).not.toHaveProperty('orgContactName');
    expect(updateArg).not.toHaveProperty('orgContactEmail');
    expect(updateArg).not.toHaveProperty('orgContactPhone');
  });

  it('does not write fields whose values are undefined in options', async () => {
    await updateApplicationStatus('u1', 'opp1', 'approved', {
      decisionMessage: undefined,
      orgContactName: undefined,
    });

    const updateArg = mockUpdateDoc.mock.calls[0][1] as Record<string, unknown>;
    expect(updateArg).not.toHaveProperty('decisionMessage');
    expect(updateArg).not.toHaveProperty('orgContactName');
  });

  it('fires a decision notification for approved status', async () => {
    await updateApplicationStatus('u1', 'opp1', 'approved');

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        recipientId: 'u1',
        type: 'decision',
        status: 'approved',
        opportunityTitle: 'Beach Cleanup',
        unread: true,
      })
    );
  });

  it('fires a decision notification for denied status', async () => {
    await updateApplicationStatus('u1', 'opp1', 'denied');

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: 'denied', recipientId: 'u1' })
    );
  });

  it('does not fire a notification for completed status', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ...appDocData, status: 'approved' }),
    });
    // Also mock the student profile lookup for badge logic
    mockGetDoc
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ ...appDocData, status: 'approved' }) })
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ hoursCompleted: 0, badges: [] }) });

    await updateApplicationStatus('u1', 'opp1', 'completed');

    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('throws when the application document does not exist', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });

    await expect(updateApplicationStatus('u1', 'opp1', 'approved')).rejects.toThrow('Application not found.');
  });
});

describe('submitExternalOpportunity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockImplementation((dbInstance: any, collectionPath: string, docId: string) => `${collectionPath}/${docId}`);
    
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
