import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../login-form';
import { signIn } from '@/lib/firebase/auth';

// Mock Firebase auth
jest.mock('@/lib/firebase/auth', () => ({
  signIn: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form with all required fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show validation errors when form is submitted empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // Use fireEvent.submit as user.click on button isn't triggering submit reliably in this env
    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('should call signIn with correct credentials on valid form submission', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
    } as any);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should display error message when login fails', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValue(new Error('Incorrect password.'));

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => {
      expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100))
    );

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    fireEvent.submit(screen.getByTestId('login-form'));

    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /logging in/i })).not.toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;
    const showPasswordCheckbox = screen.getByLabelText(/show password/i);

    expect(passwordInput.type).toBe('password');

    await user.click(showPasswordCheckbox);

    expect(passwordInput.type).toBe('text');

    await user.click(showPasswordCheckbox);

    expect(passwordInput.type).toBe('password');
  });

  it('should clear email error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    await user.type(emailInput, 'test@example.com');

    await waitFor(() => {
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });
  });
});
