import { z } from 'zod';
import type { ZodRawShape, ZodTypeAny } from 'zod';

export const BASE_DEFAULTS = {
  STRING: '',
  NUMBER: 0,
  BOOLEAN: false,
  DATE: new Date(),
  OBJECT: {},
  ARRAY: [],
  NULL: null,
  UNDEFINED: undefined,
};

type ExtractedDefaults<T> = {
  [P in keyof T]?: T[P] extends ZodTypeAny ? ReturnType<T[P]['parse']> : never;
};

export function extractDefaultsFromSchema<TSchema extends ZodRawShape>(
  schema: z.ZodObject<TSchema>
): ExtractedDefaults<TSchema> {
  const schemaShape = schema.shape;
  const result = {} as ExtractedDefaults<TSchema>;

  for (const key in schemaShape) {
    const fieldSchema = schemaShape[key];
    result[key as keyof TSchema] = extractValueFromSchema(fieldSchema!) as ExtractedDefaults<TSchema>[keyof TSchema];
  }

  return result;
}

function extractValueFromSchema<T extends ZodTypeAny>(fieldSchema: T): unknown {
  if (fieldSchema instanceof z.ZodDefault) {
    return (fieldSchema._def as { defaultValue: () => unknown }).defaultValue() as ReturnType<T['parse']>;
  } else if (fieldSchema instanceof z.ZodObject) {
    return extractDefaultsFromSchema(fieldSchema);
  } else if (fieldSchema instanceof z.ZodArray) {
    return BASE_DEFAULTS.ARRAY.slice();
  } else {
    return handleBaseTypes(fieldSchema);
  }
}

function handleBaseTypes<T extends ZodTypeAny>(fieldSchema: T): unknown {
  switch (fieldSchema.constructor) {
    case z.ZodString:
      return BASE_DEFAULTS.STRING;
    case z.ZodDate:
      return BASE_DEFAULTS.DATE;
    case z.ZodNumber:
      return BASE_DEFAULTS.NUMBER;
    case z.ZodBoolean:
      return BASE_DEFAULTS.BOOLEAN;
    case z.ZodNull:
      return BASE_DEFAULTS.NULL;
    case z.ZodNullable:
      return BASE_DEFAULTS.NULL;
    case z.ZodOptional:
      return BASE_DEFAULTS.UNDEFINED;
    default:
      return handleTransformedTypes(fieldSchema);
  }
}

function handleTransformedTypes<T extends ZodTypeAny>(fieldSchema: T): unknown {
  if (fieldSchema instanceof z.ZodTransformer && (fieldSchema._def as { innerType: ZodTypeAny }).innerType) {
    return extractValueFromSchema((fieldSchema._def as { innerType: ZodTypeAny }).innerType);
  }
  return BASE_DEFAULTS.UNDEFINED;
}
