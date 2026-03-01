import { type LucideIcon } from 'lucide-react';

export interface TypeConfig {
  router: string;
  collection: string;

  display: {
    singular: string;
    plural: string;
  };

  pathInternal?: string;
  path?: string;
  dataTestId?: string;
}

export interface TypeConfigClient extends TypeConfig {
  pathInternal: string;
  icon: LucideIcon;
}

export type CollectionType = 'unknown';
export type CollectionTypeId = 'unknown';
