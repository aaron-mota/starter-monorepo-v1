import { useBasicCRUDProcedure } from '../../../helpers/use-basic-crud-procedure';
import { adapterFnApiToFE, adapterFnFEToApiCreate, adapterFnFEToApiUpdate, schema, TYPE } from './_config';
import type { TDoc, TDocApi, TDocApiCreate, TDocApiUpdate, TDocCreate, TDocUpdate } from './_config';

export const resource = TYPE.path;

const basicCRUD = useBasicCRUDProcedure<TDoc, TDocApi, TDocCreate, TDocApiCreate, TDocUpdate, TDocApiUpdate>({
  resource,
  adapterFnApiToFE,
  schema,
  adapterFnFEToApiCreate,
  adapterFnFEToApiUpdate,
});

export const router = {
  getSingleById: basicCRUD.getSingle,
  getSingleWhere: basicCRUD.getSingleWhere,
  getMany: basicCRUD.getMany,
  create: basicCRUD.create,
  createMany: basicCRUD.createMany,
  update: basicCRUD.update,
  delete: basicCRUD.delete,
};
