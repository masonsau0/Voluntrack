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

  it('should render signup form with all required fields', () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should show validation errors when form is submitted empty', async () => {
    render(<SignupForm />);

    const submitButton = screen.getByRole('button', { name: /sign up/i });
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

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

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

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during signup', async () => {
    mockSignUp.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100))
    );

    render(<SignupForm />);

    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!' } });
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

    // Initial state — no requirements met
    expect(screen.getByText(/at least 6 characters/i)).toHaveClass('text-red-600');

    // Type a password that meets all character requirements
    fireEvent.change(passwordInput, { target: { value: 'Pass1!' } });

    expect(screen.getByText(/at least 6 characters/i)).toHaveClass('text-green-600');
    expect(screen.getByText(/one uppercase letter/i)).toHaveClass('text-green-600');
    expect(screen.getByText(/one symbol/i)).toHaveClass('text-green-600');
  });

  it('should show "passwords match" requirement as green when passwords match', () => {
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!' } });

    expect(screen.getByText(/passwords match/i)).toHaveClass('text-green-600');
  });

  it('should show error when passwords do not match', () => {
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'DifferentPassword123!' } });

    expect(screen.getByText(/passwords match/i)).toHaveClass('text-red-600');
  });

  it('should toggle password field visibility', () => {
    render(<SignupForm />);

    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButtons[0]);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButtons[0]);
    expect(passwordInput.type).toBe('password');
  });

  it('should toggle confirm password field visibility independently', () => {
    render(<SignupForm />);

    const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
    const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i });

    expect(confirmPasswordInput.type).toBe('password');

    fireEvent.click(toggleButtons[1]);
    expect(confirmPasswordInput.type).toBe('text');

    fireEvent.click(toggleButtons[1]);
    expect(confirmPasswordInput.type).toBe('password');
  });

  it('should not submit when password is too short', async () => {
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Abc!1' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Abc!1' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/password does not meet all requirements/i)).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should not submit when password lacks an uppercase letter', async () => {
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/password does not meet all requirements/i)).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should not submit when password lacks a symbol', async () => {
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/password does not meet all requirements/i)).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should render login link with correct href', () => {
    render(<SignupForm />);

    const loginLink = screen.getByRole('link', { name: /log in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should display school email note', () => {
    render(<SignupForm />);

    expect(screen.getByText(/please use your school email address/i)).toBeInTheDocument();
  });

  it('should clear errors when user starts typing in a field', async () => {
    render(<SignupForm />);

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument();
    });
  });
});
