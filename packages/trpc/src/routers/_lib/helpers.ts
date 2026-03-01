import 'server-only';

import { ObjectId } from 'mongodb';

export const adapterFnIdDbToFEServer = (id: ObjectId) => id.toString();

export const adapterFnIdFEToDbServer = (id: string) => new ObjectId(id);

export const adapterFnIdDbToApiServer = (id: ObjectId) => id.toString();

export const adapterFnIdApiToDbServer = (id: string) => new ObjectId(id);
