import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { supabase } from '@/lib/supabase';
import { describe, it, expect } from 'vitest';

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />);
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  });

  it('calls supabase signInWithPassword on submit', async () => {
    render(<LoginForm />);
    
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
