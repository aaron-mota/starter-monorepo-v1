'use client';

/**
 * TEMPLATE — Form for creating or updating an entity document.
 *
 * Real implementation should:
 *   1. Use react-hook-form + zodResolver against SCHEMA_CREATE/SCHEMA_UPDATE from `../_config`.
 *   2. Call `mutationCreate` or `mutationUpdate` from `../_lib/use-mutations`.
 *   3. Render a real field per schema attribute (text inputs, selects, switches, etc.).
 *
 * This placeholder keeps the build green and shows the surface area to fill in.
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TDocCreate, TDocUpdate } from '../_config';

interface Props {
  mode: 'create' | 'update';
  initial?: TDocUpdate;
  onSubmit?: (data: TDocCreate) => void;
  onCancel?: () => void;
}

export function FormCrud({ mode, onSubmit, onCancel }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: collect form data via react-hook-form and call onSubmit with the parsed value.
        onSubmit?.({} as TDocCreate);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="example-field">Field name</Label>
        <Input id="example-field" placeholder="Replace with real form fields" />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{mode === 'create' ? 'Create' : 'Save'}</Button>
      </div>
    </form>
  );
}
