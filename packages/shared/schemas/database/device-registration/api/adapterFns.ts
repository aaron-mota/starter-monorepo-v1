import { adapterFnIdApiToFE } from '../../_partial/database-object/client/adapterFns';
import type { TDoc, TDocCreate, TDocUpdate } from '../client/types';
import type { TDocApi, TDocApiCreate, TDocApiUpdate } from './types';

export function adapterFnApiToFE(data: TDocApi): TDoc {
  const { _id, createdAt, updatedAt, userId, lastActiveAt, ...rest } = data;
  return {
    id: adapterFnIdApiToFE(_id)!,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    userId: adapterFnIdApiToFE(userId),
    ...(lastActiveAt ? { lastActiveAt: new Date(lastActiveAt) } : {}),
    ...rest,
  };
}

export function adapterFnFEToApiCreate(data: TDocCreate): TDocApiCreate {
  return data;
}

export function adapterFnFEToApiUpdate(data: TDocUpdate): TDocApiUpdate {
  return data;
}
