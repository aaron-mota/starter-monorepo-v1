import { z } from 'zod';
import type { ZodObject, ZodRawShape } from 'zod';

export const createMongoQuerySchema = <T extends ZodObject<ZodRawShape>>(baseSchema: T) => {
  const shape = baseSchema.shape;
  const enhancedValueShape = Object.fromEntries(
    Object.entries(shape).map(([key, zodType]) => {
      return [
        key,
        z.union([
          zodType,
          createMongoOperatorSchema(zodType as z.ZodTypeAny),
          ...(zodType instanceof z.ZodString ? [z.instanceof(RegExp)] : []),
        ]),
      ];
    })
  );

  enhancedValueShape._id = z.union([z.string(), createMongoOperatorSchema(z.string()), z.instanceof(RegExp)]);

  return z.object(enhancedValueShape).partial();
};

export const createSortSchema = <T extends ZodObject<ZodRawShape>>(baseSchema: T) => {
  const shape = baseSchema.shape;
  const sortValueShape = Object.fromEntries(
    Object.entries(shape).map(([key]) => [key, z.union([z.literal(1), z.literal(-1)])])
  );
  return z.object(sortValueShape).partial();
};

export const createProjectionSchema = <T extends ZodObject<ZodRawShape>>(baseSchema: T) => {
  const shape = baseSchema.shape;
  const projectionValueShape = Object.fromEntries(
    Object.entries(shape).map(([key]) => [key, z.union([z.literal(0), z.literal(1)])])
  );
  return z.object(projectionValueShape).partial();
};

export const createMongoOperatorSchema = <T extends z.ZodTypeAny>(valueSchema: T) => {
  return z
    .object({
      $eq: valueSchema.optional(),
      $gt: valueSchema.optional(),
      $gte: valueSchema.optional(),
      $in: z.array(valueSchema).optional(),
      $lt: valueSchema.optional(),
      $lte: valueSchema.optional(),
      $ne: valueSchema.optional(),
      $nin: z.array(valueSchema).optional(),
      $exists: z.boolean().optional(),
      $regex: z.union([z.string(), z.instanceof(RegExp)]).optional(),
      $options: z.string().optional(),
    })
    .partial();
};
