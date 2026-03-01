import 'server-only';

import { adapterFnIdDbToFEClient, adapterFnIdFEToDbServer } from '../../_partial/database-object/server/adapterFns';
import { type TDocDb, type TDocDbCreate, type TDocDbUpdate } from './types';
import type { TDoc, TDocCreate, TDocUpdate } from '../client/types';

export function adapterFnDbToFE(data: TDocDb): TDoc {
  const { _id, createdAt, updatedAt, ownerId, ...rest } = data;
  return {
    id: adapterFnIdDbToFEClient(_id),
    createdAt,
    updatedAt,
    ownerId: adapterFnIdDbToFEClient(ownerId),
    ...rest,
  };
}

export function adapterFnFEToDbPartial(data: Partial<TDoc> | undefined): Partial<TDocDb> | undefined {
  if (!data) return undefined;
  const { id, ownerId, ...rest } = data;
  const dataDb: Partial<TDocDb> = {
    _id: id ? adapterFnIdFEToDbServer(id) : undefined,
    ownerId: ownerId ? adapterFnIdFEToDbServer(ownerId) : undefined,
    ...rest,
  };
  Object.keys(dataDb).forEach(
    (key) => dataDb[key as keyof typeof dataDb] === undefined && delete dataDb[key as keyof typeof dataDb]
  );
  if (Object.keys(dataDb).length === 0) return undefined;
  return dataDb;
}

export function adapterFnFEToDbCreate(data: TDocCreate): TDocDbCreate {
  const { ownerId, ...rest } = data;
  return {
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: adapterFnIdFEToDbServer(ownerId),
    ...rest,
  };
}

export function adapterFnFEToDbUpdate(data: TDocUpdate): TDocDbUpdate {
  const { ownerId, ...rest } = data;
  const dataDb: TDocDbUpdate = {
    updatedAt: new Date(),
    ownerId: ownerId ? adapterFnIdFEToDbServer(ownerId) : undefined,
    ...rest,
  };
  Object.keys(dataDb).forEach(
    (key) => dataDb[key as keyof typeof dataDb] === undefined && delete dataDb[key as keyof typeof dataDb]
  );
  return dataDb;
}
