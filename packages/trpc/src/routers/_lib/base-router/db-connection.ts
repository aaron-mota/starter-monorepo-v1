import { connectToDatabase } from '@starter/db';
import { TRPCError } from '@trpc/server';
import type { Db } from 'mongodb';

export async function ensureDbConnection(dbArg: Db | null): Promise<Db> {
  let dbFinal: Db | null = dbArg;

  if (!dbFinal) {
    try {
      const { db } = await connectToDatabase();
      dbFinal = db;
    } catch (error) {
      console.error('Failed to establish database connection:', error);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to establish database connection' });
    }
  }

  if (!dbFinal) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection could not be established' });
  }

  return dbFinal;
}
