import { getDb } from './client';
import type { Db } from 'mongodb';

export async function getUsersCollection(db?: Db) {
  const database = db ?? (await getDb());
  return database.collection('User');
}

export async function getItemsCollection(db?: Db) {
  const database = db ?? (await getDb());
  return database.collection('Item');
}

export async function getCompaniesCollection(db?: Db) {
  const database = db ?? (await getDb());
  return database.collection('Company');
}

export async function getCompanyUsersCollection(db?: Db) {
  const database = db ?? (await getDb());
  return database.collection('CompanyUser');
}

export async function getSubscriptionUsersCollection(db?: Db) {
  const database = db ?? (await getDb());
  return database.collection('SubscriptionUser');
}

export async function getDeviceRegistrationsCollection(db?: Db) {
  const database = db ?? (await getDb());
  return database.collection('DeviceRegistration');
}
