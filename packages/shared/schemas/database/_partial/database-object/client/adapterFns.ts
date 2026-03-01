import { type DateOptions } from '../_lib/types';

export function adapterFnIdApiToFE(id: string): string;
export function adapterFnIdApiToFE(id: null): null;
export function adapterFnIdApiToFE(id?: undefined): undefined;
export function adapterFnIdApiToFE(id: string | null): string | null;
export function adapterFnIdApiToFE(id?: string | null | undefined): string | null | undefined;
export function adapterFnIdApiToFE(id: string | null | undefined): string | null | undefined {
  return id ? id : typeof id === 'undefined' ? undefined : null;
}

export function adapterFnIdFEToApi(id: string): string;
export function adapterFnIdFEToApi(id: null): null;
export function adapterFnIdFEToApi(id?: undefined): undefined;
export function adapterFnIdFEToApi(id: string | null): string | null;
export function adapterFnIdFEToApi(id?: string | null | undefined): string | null | undefined;
export function adapterFnIdFEToApi(id: string | null | undefined): string | null | undefined {
  return id ? id : typeof id === 'undefined' ? undefined : null;
}

export function adapterFnDateApiToFEClient(date: string, options?: DateOptions): Date;
export function adapterFnDateApiToFEClient(date: null, options?: DateOptions): null;
export function adapterFnDateApiToFEClient(date?: undefined, options?: DateOptions): undefined;
export function adapterFnDateApiToFEClient(date: string | null, options?: DateOptions): Date | null;
export function adapterFnDateApiToFEClient(
  date?: string | null | undefined,
  options?: DateOptions
): Date | null | undefined;
export function adapterFnDateApiToFEClient(
  date: string | null | undefined,
  _options?: DateOptions
): Date | null | undefined {
  if (date) {
    return new Date(date);
  }
  return typeof date === 'undefined' ? undefined : null;
}

export function adapterFnDateFEToApiClient(date: Date, options?: DateOptions): string;
export function adapterFnDateFEToApiClient(date: null, options?: DateOptions): null;
export function adapterFnDateFEToApiClient(date?: undefined, options?: DateOptions): undefined;
export function adapterFnDateFEToApiClient(date: Date | null, options?: DateOptions): string | null;
export function adapterFnDateFEToApiClient(
  date?: Date | null | undefined,
  options?: DateOptions
): string | null | undefined;
export function adapterFnDateFEToApiClient(
  date: Date | null | undefined,
  _options?: DateOptions
): string | null | undefined {
  if (date) {
    return date.toISOString();
  }
  return typeof date === 'undefined' ? undefined : null;
}
