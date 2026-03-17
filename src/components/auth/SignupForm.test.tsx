import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignupForm } from './SignupForm';
import { supabase } from '@/lib/supabase';
import { describe, it, expect } from 'vitest';

describe('SignupForm', () => {
  it('renders signup form', () => {
    render(<SignupForm />);
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });

  it('calls supabase signUp on submit', async () => {
    render(<SignupForm />);
    
    fireEvent.change(screen.getByPlaceholderText(/Jane Doe/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Get Started/i }));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Jane Doe',
          },
        },
      });
    });
  });
});
