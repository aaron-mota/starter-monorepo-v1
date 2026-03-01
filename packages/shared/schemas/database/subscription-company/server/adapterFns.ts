import 'server-only';

import { adapterFnIdDbToFEClient, adapterFnIdFEToDbServer } from '../../_partial/database-object/server/adapterFns';
import { type TDocDb, type TDocDbCreate, type TDocDbUpdate } from './types';
import type { TDoc, TDocCreate, TDocUpdate } from '../client/types';

export function adapterFnDbToFE(data: TDocDb): TDoc {
  const { _id, createdAt, updatedAt, companyId, ...rest } = data;
  return {
    id: adapterFnIdDbToFEClient(_id),
    createdAt,
    updatedAt,
    companyId: adapterFnIdDbToFEClient(companyId),
    ...rest,
  };
}

export function adapterFnFEToDbPartial(data: Partial<TDoc> | undefined): Partial<TDocDb> | undefined {
  if (!data) return undefined;
  const { id, companyId, ...rest } = data;
  const dataDb: Partial<TDocDb> = {
    _id: id ? adapterFnIdFEToDbServer(id) : undefined,
    companyId: companyId ? adapterFnIdFEToDbServer(companyId) : undefined,
    ...rest,
  };
  Object.keys(dataDb).forEach(
    (key) => dataDb[key as keyof typeof dataDb] === undefined && delete dataDb[key as keyof typeof dataDb]
  );
  if (Object.keys(dataDb).length === 0) return undefined;
  return dataDb;
}

export function adapterFnFEToDbCreate(data: TDocCreate): TDocDbCreate {
  const { companyId, ...rest } = data;
  return {
    createdAt: new Date(),
    updatedAt: new Date(),
    companyId: adapterFnIdFEToDbServer(companyId),
    ...rest,
  };
}

export function adapterFnFEToDbUpdate(data: TDocUpdate): TDocDbUpdate {
  const { ...rest } = data;
  const dataDb: TDocDbUpdate = {
    updatedAt: new Date(),
    ...rest,
  };
  Object.keys(dataDb).forEach(
    (key) => dataDb[key as keyof typeof dataDb] === undefined && delete dataDb[key as keyof typeof dataDb]
  );
  return dataDb;
}
