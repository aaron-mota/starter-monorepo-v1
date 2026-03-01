import { PageHeader } from '../page-header';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    render(<PageHeader title="Dashboard" description="Welcome back" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('renders optional action slot', () => {
    render(<PageHeader title="Tags" action={<button>Add Tag</button>} />);
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Add Tag')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<PageHeader title="Settings" />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });
});
