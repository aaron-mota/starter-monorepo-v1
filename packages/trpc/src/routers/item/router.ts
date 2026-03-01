import { createBaseRouter } from '../_base';
import { router as trpcRouter } from '../../trpc-server';
import {
  adapterFnDbToFE,
  adapterFnFEToDbCreate,
  adapterFnFEToDbPartial,
  adapterFnFEToDbUpdate,
  schema,
  schemaCreate,
  schemaDb,
  schemaDbCreate,
  schemaDbUpdate,
  schemaUpdate,
  TYPE,
} from './_config';

const routerBase = createBaseRouter({
  config: {
    routerName: TYPE.router,
    collectionName: TYPE.collection,
  },
  schemas: {
    schema,
    schemaCreate,
    schemaUpdate,
    schemaDb,
    schemaDbCreate,
    schemaDbUpdate,
  },
  adapterFns: {
    adapterFnDbToFE,
    adapterFnToDbPartial: adapterFnFEToDbPartial,
    adapterFnToDbCreate: adapterFnFEToDbCreate,
    adapterFnToDbUpdate: adapterFnFEToDbUpdate,
  },
});

export const router = trpcRouter({
  getSingleById: routerBase.getSingleById,
  getSingleWhere: routerBase.getSingleWhere,
  getSingleMongo: routerBase.getSingleMongo,
  getMany: routerBase.getMany,
  getManyMongo: routerBase.getManyMongo,
  getManyOptions: routerBase.getManyOptions,
  getAll: routerBase.getAll,
  getLatest: routerBase.getLatest,
  getCount: routerBase.getCount,
  getCountMongo: routerBase.getCountMongo,
  create: routerBase.create,
  createMany: routerBase.createMany,
  update: routerBase.update,
  updateMany: routerBase.updateMany,
  delete: routerBase.delete,
  deleteMany: routerBase.deleteMany,
  deleteMongo: routerBase.deleteMongo,
});
