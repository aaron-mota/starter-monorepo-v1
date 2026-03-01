import 'server-only';

import { type DateOptions } from '../_lib/types';
import { ObjectId } from 'mongodb';

export function adapterFnIdDbToFEClient(id: ObjectId): string;
export function adapterFnIdDbToFEClient(id: null): null;
export function adapterFnIdDbToFEClient(id?: undefined): undefined;
export function adapterFnIdDbToFEClient(id: ObjectId | null): string | null;
export function adapterFnIdDbToFEClient(id?: ObjectId | null | undefined): string | null | undefined;
export function adapterFnIdDbToFEClient(id: ObjectId | null | undefined): string | null | undefined {
  return id ? id.toHexString() : typeof id === 'undefined' ? undefined : null;
}

export function adapterFnIdFEToDbClient(id: string): ObjectId;
export function adapterFnIdFEToDbClient(id: null): null;
export function adapterFnIdFEToDbClient(id?: undefined): undefined;
export function adapterFnIdFEToDbClient(id: string | null): ObjectId | null;
export function adapterFnIdFEToDbClient(id?: string | null | undefined): ObjectId | null | undefined;
export function adapterFnIdFEToDbClient(id: string | null | undefined): ObjectId | null | undefined {
  return id ? new ObjectId(id) : typeof id === 'undefined' ? undefined : null;
}

export const adapterFnIdFEToDbServer = adapterFnIdFEToDbClient;

export function adapterFnDateApiToDbClient(date: string, options?: DateOptions): Date;
export function adapterFnDateApiToDbClient(date: null, options?: DateOptions): null;
export function adapterFnDateApiToDbClient(date?: undefined, options?: DateOptions): undefined;
export function adapterFnDateApiToDbClient(date: string | null, options?: DateOptions): Date | null;
export function adapterFnDateApiToDbClient(
  date?: string | null | undefined,
  options?: DateOptions
): Date | null | undefined;
export function adapterFnDateApiToDbClient(
  date: string | null | undefined,
  _options?: DateOptions
): Date | null | undefined {
  if (date) {
    return new Date(date);
  }
  return typeof date === 'undefined' ? undefined : null;
}

export function adapterFnDateDbToApiClient(date: Date, options?: DateOptions): string;
export function adapterFnDateDbToApiClient(date: null, options?: DateOptions): null;
export function adapterFnDateDbToApiClient(date?: undefined, options?: DateOptions): undefined;
export function adapterFnDateDbToApiClient(date: Date | null, options?: DateOptions): string | null;
export function adapterFnDateDbToApiClient(
  date?: Date | null | undefined,
  options?: DateOptions
): string | null | undefined;
export function adapterFnDateDbToApiClient(
  date: Date | null | undefined,
  _options?: DateOptions
): string | null | undefined {
  if (date) {
    return date.toISOString();
  }
  return typeof date === 'undefined' ? undefined : null;
}
