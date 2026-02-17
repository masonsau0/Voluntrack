import { signIn, signUp, signOutUser, getUserProfile } from '../auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config';

// Mock Firebase modules
jest.mock('firebase/auth');
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 })),
}));
jest.mock('../config', () => ({
  auth: {},
  db: {},
}));

const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

describe('Firebase Auth Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should successfully sign in a user with valid credentials', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      } as any;

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any);

      const result = await signIn('test@example.com', 'password123');

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password123'
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw an error for invalid email', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/invalid-email',
      });

      await expect(signIn('invalid-email', 'password123')).rejects.toThrow(
        'Invalid email address.'
      );
    });

    it('should throw an error for wrong password', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/wrong-password',
      });

      await expect(signIn('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Incorrect password.'
      );
    });

    it('should throw an error for user not found', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/user-not-found',
      });

      await expect(signIn('nonexistent@example.com', 'password123')).rejects.toThrow(
        'No account found with this email address.'
      );
    });
  });

  describe('signUp', () => {
    it('should successfully create a new user and user profile', async () => {
      const mockUser = {
        uid: 'new-user-uid',
        email: 'newuser@example.com',
      } as any;

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any);
      mockSetDoc.mockResolvedValue(undefined);

      const signUpData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        school: 'Test School',
      };

      const result = await signUp(signUpData);

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'newuser@example.com',
        'password123'
      );
      expect(mockSetDoc).toHaveBeenCalledWith(
        doc(db, 'users', 'new-user-uid'),
        expect.objectContaining({
          email: 'newuser@example.com',
          firstName: 'John',
          lastName: 'Doe',
          school: 'Test School',
        })
      );
      // Verify that createdAt and updatedAt are set (they use serverTimestamp)
      const setDocCall = mockSetDoc.mock.calls[0];
      expect(setDocCall[1]).toHaveProperty('createdAt');
      expect(setDocCall[1]).toHaveProperty('updatedAt');
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if email is already in use', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/email-already-in-use',
      });

      const signUpData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        school: 'Test School',
      };

      await expect(signUp(signUpData)).rejects.toThrow(
        'An account with this email already exists.'
      );
    });

    it('should throw an error for weak password', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/weak-password',
      });

      const signUpData = {
        email: 'newuser@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
        school: 'Test School',
      };

      await expect(signUp(signUpData)).rejects.toThrow('Password is too weak.');
    });
  });

  describe('signOutUser', () => {
    it('should successfully sign out the current user', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await signOutUser();

      expect(mockSignOut).toHaveBeenCalledWith(auth);
    });

    it('should throw an error if sign out fails', async () => {
      mockSignOut.mockRejectedValue({
        code: 'auth/network-request-failed',
      });

      await expect(signOutUser()).rejects.toThrow('Network error. Please check your connection.');
    });
  });

  describe('getUserProfile', () => {
    it('should successfully retrieve user profile from Firestore', async () => {
      const mockUserData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        school: 'Test School',
        createdAt: { seconds: 1234567890 },
        updatedAt: { seconds: 1234567890 },
      };

      const mockDocRef = doc(db, 'users', 'test-uid');
      const mockDocSnap = {
        exists: () => true,
        id: 'test-uid',
        data: () => mockUserData,
      };

      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await getUserProfile('test-uid');

      expect(mockGetDoc).toHaveBeenCalledWith(mockDocRef);
      expect(result).toEqual({
        uid: 'test-uid',
        ...mockUserData,
      });
    });

    it('should return null if user document does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await getUserProfile('nonexistent-uid');

      expect(result).toBeNull();
    });

    it('should throw an error if Firestore query fails', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(getUserProfile('test-uid')).rejects.toThrow('Firestore error');
    });
  });
});
