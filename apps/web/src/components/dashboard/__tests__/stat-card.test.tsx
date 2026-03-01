import { StatCard } from '../stat-card';
import { render, screen } from '@testing-library/react';
import { Activity } from 'lucide-react';
import { describe, expect, it } from 'vitest';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Items" value={42} />);
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<StatCard title="Events" value={10} description="in last 24h" />);
    expect(screen.getByText('in last 24h')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(<StatCard title="Items" value={5} icon={Activity} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
