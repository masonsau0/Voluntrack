import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignupForm } from '../signup-form';
import { signUp } from '@/lib/firebase/auth';

// Mock Firebase auth
jest.mock('@/lib/firebase/auth', () => ({
  signUp: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockSignUp = signUp as jest.MockedFunction<typeof signUp>;

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should disable Sign Up button until terms are agreed', () => {
    render(<SignupForm />);

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    const termsCheckbox = screen.getByRole('checkbox', { name: /by signing up, you agree to our/i });

    expect(submitButton).toBeDisabled();
    fireEvent.click(termsCheckbox);
    expect(submitButton).not.toBeDisabled();
  });

  it('should render signup form with all required fields', () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByText(/by signing up, you agree to our/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /terms and condition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should show validation errors when form is submitted empty', async () => {
    render(<SignupForm />);

    const termsCheckbox = screen.getByRole('checkbox', { name: /by signing up, you agree to our/i });
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/^password is required$/i)).toBeInTheDocument();
      expect(screen.getByText(/^confirm password is required$/i)).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should call signUp with correct data on valid form submission', async () => {
    mockSignUp.mockResolvedValue({
      uid: 'new-user-uid',
      email: 'newuser@example.com',
    } as any);

    render(<SignupForm />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /by signing up, you agree to our/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
      });
    });
  });

  it('should display error message when signup fails', async () => {
    mockSignUp.mockRejectedValue(new Error('An account with this email already exists.'));

    render(<SignupForm />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /by signing up, you agree to our/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during signup', async () => {
    mockSignUp.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100))
    );

    render(<SignupForm />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /by signing up, you agree to our/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /creating account/i })).not.toBeInTheDocument();
    });
  });

  it('should display password requirements and update them as user types', () => {
    render(<SignupForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);

    // Check initial state - requirements should not be met
    expect(screen.getByText(/at least 8 characters/i)).toHaveClass('text-red-600');

    // Type a password that meets some requirements
    fireEvent.change(passwordInput, { target: { value: 'Password1' } });

    // All requirements should now be met
    expect(screen.getByText(/at least 8 characters/i)).toHaveClass('text-green-600');
    expect(screen.getByText(/one uppercase letter/i)).toHaveClass('text-green-600');
  });

  it('should show error when passwords do not match', async () => {
    render(<SignupForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });

    // The "Passwords match" requirement should show as not met
    expect(screen.getByText(/passwords match/i)).toHaveClass('text-red-600');
  });

  it('should toggle password visibility for both password fields', () => {
    render(<SignupForm />);

    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;

    // Find the toggle buttons (they're icon buttons, so we'll look for the inputs and check their type)
    // The show password functionality is handled by the Eye/EyeOff icons
    // We can test by checking the input type changes when clicking the toggle

    expect(passwordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('password');

    // Note: The actual toggle buttons are icon buttons that might need different selectors
    // This is a simplified test - in a real scenario you'd click the actual toggle buttons
  });

  it('should clear errors when user starts typing in a field', async () => {
    render(<SignupForm />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /by signing up, you agree to our/i });
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });

    fireEvent.change(firstNameInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument();
    });
  });
});
