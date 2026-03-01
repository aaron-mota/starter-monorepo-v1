import 'server-only';

import { type ObjectId } from 'mongodb';

export type MongoDoc<T> = Omit<T, '_id'> & { _id: ObjectId };
