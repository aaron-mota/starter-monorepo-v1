import { EmptyState } from '../empty-state';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tags } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon={Tags} title="No tags" description="Create your first tag." />);
    expect(screen.getByText('No tags')).toBeInTheDocument();
    expect(screen.getByText('Create your first tag.')).toBeInTheDocument();
  });

  it('renders optional CTA button', () => {
    const onClick = vi.fn();
    render(
      <EmptyState icon={Tags} title="No tags" description="Create a tag." actionLabel="Add Tag" onAction={onClick} />
    );
    expect(screen.getByText('Add Tag')).toBeInTheDocument();
  });

  it('fires onClick when CTA is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <EmptyState icon={Tags} title="No tags" description="Create a tag." actionLabel="Add Tag" onAction={onClick} />
    );
    await user.click(screen.getByText('Add Tag'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
