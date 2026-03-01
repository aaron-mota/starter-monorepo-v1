type StripeMethod = 'GET' | 'POST' | 'DELETE' | 'PUT';

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  return Object.keys(obj).reduce((acc: Record<string, string>, k) => {
    const pre = prefix.length ? `${prefix}[${k}]` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k] as Record<string, unknown>, pre));
    } else if (Array.isArray(obj[k])) {
      (obj[k] as unknown[]).forEach((v: unknown, i: number) => {
        acc[`${pre}[${i}]`] = String(v);
      });
    } else {
      acc[pre] = String(obj[k]);
    }
    return acc;
  }, {});
}

async function makeStripeRequest<T>(method: StripeMethod, path: string, data?: Record<string, unknown>): Promise<T> {
  const url = `https://api.stripe.com/v1${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
  };

  let body: string | undefined;

  if (data) {
    if (method === 'GET') {
      const params = new URLSearchParams(data as Record<string, string>);
      // Note: for GET, append query params to URL
      return makeStripeRequest<T>(method, `${path}?${params.toString()}`);
    } else {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = new URLSearchParams(flattenObject(data)).toString();
    }
  }

  const response = await fetch(url, { method, headers, body });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Stripe API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return response.json() as T;
}

export async function createStripeCustomer(email: string) {
  return makeStripeRequest<{ id: string }>('POST', '/customers', { email });
}

export async function deleteStripeCustomer(customerId: string) {
  return makeStripeRequest<{ id: string; deleted: boolean }>('DELETE', `/customers/${customerId}`);
}
