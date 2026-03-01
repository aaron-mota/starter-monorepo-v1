import { extractDefaultsFromSchema } from '../../../_helpers';
import { schema, schemaCreate, schemaUpdate } from './schema';
import type { TDoc, TDocCreate, TDocUpdate } from './types';

export const DEFAULT_VALUES = extractDefaultsFromSchema(schemaCreate);

export const KEYS_RELATIONSHIP_ID: string[] = [];
export const KEYS_RELATIONSHIP_DOC: string[] = [];
export const KEYS_FORM_CREATE = Object.keys(schemaCreate.shape) as (keyof TDocCreate)[];
export const KEYS_FORM_UPDATE = Object.keys(schemaUpdate.shape).filter((k) => k !== 'id') as (keyof TDocUpdate)[];
export const KEYS_TABLE = Object.keys(schema.shape) as (keyof TDoc)[];
