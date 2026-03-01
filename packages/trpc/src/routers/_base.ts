import 'server-only';

import { protectedProcedure, publicProcedure, router } from '../trpc-server';
import {
  createFn,
  createManyFn,
  createMongoQuerySchema,
  createProjectionSchema,
  createSortSchema,
  deleteFn,
  deleteManyFn,
  deleteMongoFn,
  getAllFn,
  getCountFn,
  getCountMongoFn,
  getLatestFn,
  getManyFn,
  getManyLimitedFieldsFn,
  getManyMongoFn,
  getManyOptionsFn,
  getNearFn,
  getSingleByIdFn,
  getSingleMongoFn,
  getSingleWhereFn,
  updateFn,
  updateManyFn,
} from './_lib/base-router';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import type { ZodObject, ZodRawShape } from 'zod';

interface Procedure {
  enabled?: boolean;
  type?: 'public' | 'protected';
}

type ProcedureKey =
  | 'getSingleById'
  | 'getSingleWhere'
  | 'getSingleMongo'
  | 'getLatest'
  | 'getAll'
  | 'getMany'
  | 'getManyLimitedFields'
  | 'getManyMongo'
  | 'getCount'
  | 'getCountMongo'
  | 'create'
  | 'update'
  | 'delete'
  | 'deleteMongo'
  | 'createMany'
  | 'updateMany'
  | 'deleteMany'
  | 'getManyOptions'
  | 'getNear';

interface Config {
  routerName: string;
  collectionName: string;
  procedures?: Partial<Record<ProcedureKey, Procedure>>;
}

interface Args<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> {
  config: Config;
  schemas: {
    schema: T;
    schemaCreate: C;
    schemaUpdate: U;
    schemaDb: TDb;
    schemaDbCreate: CDb;
    schemaDbUpdate: UDb;
  };
  adapterFns: {
    adapterFnDbToFE: (doc: z.infer<TDb>) => z.infer<T>;
    adapterFnToDbPartial: (doc: Partial<z.infer<T>> | undefined) => Partial<z.infer<TDb>> | undefined;
    adapterFnToDbCreate: (docCreate: z.infer<C>) => z.infer<CDb>;
    adapterFnToDbUpdate: (docUpdate: z.infer<U>) => z.infer<UDb>;
  };
}

export const createBaseRouter = <
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({
  config,
  schemas,
  adapterFns,
}: Args<T, C, U, TDb, CDb, UDb>) => {
  const { routerName, collectionName, procedures } = config;
  const { schema, schemaCreate, schemaUpdate } = schemas;

  const schemaObjectId = z.string().refine((val) => ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
  });

  const getProcedure = (name: ProcedureKey) => {
    function getDefaultType(name: ProcedureKey) {
      switch (name) {
        case 'create':
        case 'update':
        case 'delete':
        case 'createMany':
        case 'updateMany':
        case 'deleteMany':
        case 'getNear':
          return 'protected';
        default:
          return 'public';
      }
    }

    const procedureConfig = procedures?.[name] || {
      type: getDefaultType(name),
    };
    return procedureConfig.type === 'protected' ? protectedProcedure : publicProcedure;
  };

  // MongoDB query schemas
  const schemaWithIdDb = schema.extend({ _id: z.string() });
  const baseQuerySchema = createMongoQuerySchema(schemaWithIdDb);
  const whereSchema = baseQuerySchema.and(
    z
      .object({
        $or: z.array(baseQuerySchema),
        $and: z.array(baseQuerySchema),
      })
      .partial()
  );

  const schemaWhere = z.object({
    where: whereSchema.optional(),
    limit: z.number().min(1).max(1000).optional(),
    skip: z.number().min(0).optional(),
    sort: createSortSchema(schemaWithIdDb).optional(),
    projection: createProjectionSchema(schemaWithIdDb).optional(),
  });

  return router({
    // Read operations
    getSingleById: getProcedure('getSingleById')
      .input(z.object({ id: schemaObjectId }))
      .query(async ({ ctx, input }) => {
        return getSingleByIdFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    getSingleWhere: getProcedure('getSingleWhere')
      .input(schema.partial())
      .query(async ({ ctx, input }) => {
        return getSingleWhereFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    getLatest: getProcedure('getLatest').query(async ({ ctx }) => {
      return getLatestFn({
        db: ctx.db,
        config: { routerName, collectionName },
        schemas,
        adapterFns,
      });
    }),

    getAll: getProcedure('getAll').query(async ({ ctx }) => {
      return getAllFn({
        db: ctx.db,
        config: { routerName, collectionName },
        schemas,
        adapterFns,
      });
    }),

    getMany: getProcedure('getMany')
      .input(schema.partial().optional())
      .query(async ({ ctx, input }) => {
        return getManyFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    getManyLimitedFields: getProcedure('getManyLimitedFields')
      .input(schema.partial().optional())
      .query(async ({ ctx, input }) => {
        return getManyLimitedFieldsFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    getManyOptions: getProcedure('getManyOptions')
      .input(schema.partial().optional())
      .query(async ({ ctx, input }) => {
        return getManyOptionsFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    getCount: getProcedure('getCount')
      .input(schema.partial().optional())
      .query(async ({ ctx, input }) => {
        return getCountFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    // MongoDB query-capable procedures
    getSingleMongo: getProcedure('getSingleMongo')
      .input(z.object({ where: createMongoQuerySchema(schema) }))
      .query(async ({ ctx, input }) => {
        return getSingleMongoFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    getManyMongo: getProcedure('getManyMongo')
      .input(schemaWhere.optional())
      .query(async ({ ctx, input }) => {
        return getManyMongoFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    getCountMongo: getProcedure('getCountMongo')
      .input(z.object({ where: createMongoQuerySchema(schema).optional() }))
      .query(async ({ ctx, input }) => {
        return getCountMongoFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    deleteMongo: getProcedure('deleteMongo')
      .input(z.object({ where: createMongoQuerySchema(schema) }))
      .mutation(async ({ ctx, input }) => {
        return deleteMongoFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    // Create/Update/Delete
    create: getProcedure('create')
      .input(schemaCreate)
      .mutation(async ({ ctx, input }) => {
        return createFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input: input as z.infer<C>,
          ctx,
        });
      }),

    update: getProcedure('update')
      .input(z.object({ id: schemaObjectId }).merge(schemaUpdate.partial()))
      .mutation(async ({ ctx, input }) => {
        return updateFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input: input as { id: string } & z.infer<typeof schemaUpdate>,
          ctx,
        });
      }),

    delete: getProcedure('delete')
      .input(z.object({ id: schemaObjectId }))
      .mutation(async ({ ctx, input }) => {
        return deleteFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
          ctx,
        });
      }),

    createMany: getProcedure('createMany')
      .input(z.array(schemaCreate))
      .mutation(async ({ ctx, input }) => {
        return createManyFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    updateMany: getProcedure('updateMany')
      .input(
        z.object({
          ids: z.array(schemaObjectId),
          data: schemaUpdate.partial(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return updateManyFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    deleteMany: getProcedure('deleteMany')
      .input(z.object({ ids: z.array(schemaObjectId) }))
      .mutation(async ({ ctx, input }) => {
        return deleteManyFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),

    // Geospatial
    getNear: getProcedure('getNear')
      .input(
        z.object({
          lat: z.number(),
          lng: z.number(),
          maxDistanceMeters: z.number().min(0).max(100000).optional(),
          locationField: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return getNearFn({
          db: ctx.db,
          config: { routerName, collectionName },
          schemas,
          adapterFns,
          input,
        });
      }),
  });
};
