import { createBaseRouter } from '../_base';
import { router as trpcRouter } from '../../trpc-server';

// import {
//   adapterFnDbToFE,
//   adapterFnFEToDbCreate,
//   adapterFnFEToDbPartial,
//   adapterFnFEToDbUpdate,
//   schema,
//   schemaCreate,
//   schemaDb,
//   schemaDbCreate,
//   schemaDbUpdate,
//   schemaUpdate,
//   TYPE,
// } from './_config';

// const routerBase = createBaseRouter({
//   config: {
//     routerName: TYPE.router,
//     collectionName: TYPE.collection,
//   },
//   schemas: { schema, schemaCreate, schemaUpdate, schemaDb, schemaDbCreate, schemaDbUpdate },
//   adapterFns: {
//     adapterFnDbToFE,
//     adapterFnToDbPartial: adapterFnFEToDbPartial,
//     adapterFnToDbCreate: adapterFnFEToDbCreate,
//     adapterFnToDbUpdate: adapterFnFEToDbUpdate,
//   },
// });

export const router = trpcRouter({
  // Uncomment and wire up base router procedures:
  // getSingleById: routerBase.getSingleById,
  // getMany: routerBase.getMany,
  // create: routerBase.create,
  // update: routerBase.update,
  // delete: routerBase.delete,
});
