import { submitReport } from '../reports';
import { collection, addDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
}));

jest.mock('../config', () => ({
  db: {},
}));

const mockCollection = collection as jest.Mock;
const mockAddDoc = addDoc as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockDoc = doc as jest.Mock;

describe('submitReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockReturnValue('doc-ref');
    mockCollection.mockReturnValue('collection-ref');
  });

  it('should submit a report successfully', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ orgId: 'org-123' }),
    });
    mockAddDoc.mockResolvedValue({ id: 'report-1' });

    const result = await submitReport('user-1', 'opp-1', 'This is a concern');

    expect(mockDoc).toHaveBeenCalledWith(db, 'opportunities', 'opp-1');
    expect(mockGetDoc).toHaveBeenCalledWith('doc-ref');
    expect(mockAddDoc).toHaveBeenCalledWith('collection-ref', {
      reporterId: 'user-1',
      opportunityId: 'opp-1',
      orgId: 'org-123',
      text: 'This is a concern',
      createdAt: 'mock-timestamp',
    });
    expect(result).toBe('report-1');
  });

  it('should trim whitespace from the report text', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ orgId: 'org-123' }),
    });
    mockAddDoc.mockResolvedValue({ id: 'report-2' });

    await submitReport('user-1', 'opp-1', '  trimmed text  ');

    expect(mockAddDoc).toHaveBeenCalledWith(
      'collection-ref',
      expect.objectContaining({ text: 'trimmed text' }),
    );
  });

  it('should throw an error for empty text', async () => {
    await expect(submitReport('user-1', 'opp-1', '   ')).rejects.toThrow(
      'Report text cannot be empty.',
    );
    expect(mockGetDoc).not.toHaveBeenCalled();
  });

  it('should throw an error for text exceeding 1000 characters', async () => {
    const longText = 'a'.repeat(1001);

    await expect(submitReport('user-1', 'opp-1', longText)).rejects.toThrow(
      'Report text cannot exceed 1000 characters.',
    );
    expect(mockGetDoc).not.toHaveBeenCalled();
  });

  it('should throw an error if opportunity not found', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => false,
    });

    await expect(
      submitReport('user-1', 'opp-missing', 'Some concern'),
    ).rejects.toThrow('Opportunity not found.');
  });

  it('should throw an error if opportunity has no orgId', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({}),
    });

    await expect(
      submitReport('user-1', 'opp-no-org', 'Some concern'),
    ).rejects.toThrow('Organization ID not found for this opportunity.');
  });

  it('should propagate Firestore errors', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ orgId: 'org-1' }),
    });
    mockAddDoc.mockRejectedValue(new Error('Firestore write failed'));

    await expect(
      submitReport('user-1', 'opp-1', 'Valid concern'),
    ).rejects.toThrow('Firestore write failed');
  });
});
