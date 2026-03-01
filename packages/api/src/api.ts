import { router as routerItem } from './routers/database/item';
import { router as routerSubscriptionCompany } from './routers/database/subscription-company';
import { router as routerSubscriptionUser } from './routers/database/subscription-user';
import { router as routerUser } from './routers/database/user';

export const api = {
  user: routerUser,
  item: routerItem,
  subscriptionUser: routerSubscriptionUser,
  subscriptionCompany: routerSubscriptionCompany,
};
