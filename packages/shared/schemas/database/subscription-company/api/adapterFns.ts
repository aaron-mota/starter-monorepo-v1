import { adapterFnIdApiToFE } from '../../_partial/database-object/client/adapterFns';
import type { TDoc, TDocCreate, TDocUpdate } from '../client/types';
import type { TDocApi, TDocApiCreate, TDocApiUpdate } from './types';

export function adapterFnApiToFE(data: TDocApi): TDoc {
  const { _id, createdAt, updatedAt, companyId, ...rest } = data;
  return {
    id: adapterFnIdApiToFE(_id)!,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    companyId: adapterFnIdApiToFE(companyId),
    ...rest,
  };
}

export function adapterFnFEToApiCreate(data: TDocCreate): TDocApiCreate {
  return data;
}

export function adapterFnFEToApiUpdate(data: TDocUpdate): TDocApiUpdate {
  return data;
}
