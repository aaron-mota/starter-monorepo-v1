import { z } from 'zod';

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

export function extractDefaultsFromSchema<TSchema extends z.ZodRawShape>(
  schema: z.ZodObject<TSchema>
): Partial<z.infer<z.ZodObject<TSchema>>> {
  const schemaShape = schema.shape;
  const result: Record<string, unknown> = {};

  for (const key in schemaShape) {
    const fieldSchema = schemaShape[key];
    if (fieldSchema) {
      result[key] = extractValueFromSchema(fieldSchema as unknown as z.ZodTypeAny);
    }
  }

  return result as Partial<z.infer<z.ZodObject<TSchema>>>;
}

function extractValueFromSchema(fieldSchema: z.ZodTypeAny): unknown {
  if (fieldSchema instanceof z.ZodDefault) {
    return fieldSchema.parse(undefined);
  }
  if (fieldSchema instanceof z.ZodObject) {
    return extractDefaultsFromSchema(fieldSchema);
  }
  if (fieldSchema instanceof z.ZodArray) {
    return BASE_DEFAULTS.ARRAY.slice();
  }
  if (fieldSchema instanceof z.ZodOptional) return BASE_DEFAULTS.UNDEFINED;
  if (fieldSchema instanceof z.ZodNullable) return BASE_DEFAULTS.NULL;
  if (fieldSchema instanceof z.ZodNull) return BASE_DEFAULTS.NULL;
  if (fieldSchema instanceof z.ZodString) return BASE_DEFAULTS.STRING;
  if (fieldSchema instanceof z.ZodNumber) return BASE_DEFAULTS.NUMBER;
  if (fieldSchema instanceof z.ZodBoolean) return BASE_DEFAULTS.BOOLEAN;
  if (fieldSchema instanceof z.ZodDate) return BASE_DEFAULTS.DATE;
  return BASE_DEFAULTS.UNDEFINED;
}
