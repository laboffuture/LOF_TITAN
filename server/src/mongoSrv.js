import dns from 'node:dns/promises';

/**
 * Expand a `mongodb+srv://` URI when the local resolver cannot.
 *
 * The +srv scheme is not a connection detail - it is a DNS lookup. Before the
 * driver opens a socket it must resolve an SRV record for the cluster and a TXT
 * record holding the connection options. On this network the corporate resolver
 * answers SERVFAIL for both (it forwards internal zones only), so the driver
 * fails at startup with `querySrv ESERVFAIL` and the API never binds its port.
 *
 * Rather than depend on the machine's DNS being fixed - it is the same resolver
 * the company server will sit behind - we do the lookup ourselves and fall back
 * to a public resolver when the system one refuses. The result is folded into a
 * plain `mongodb://` URI listing the hosts explicitly, which needs no DNS beyond
 * ordinary A records.
 *
 * Nothing here changes where we connect or who we connect as: the credentials,
 * database and options come from the same URI, and the hosts come from Atlas's
 * own DNS records.
 */

/** Tried in order, only after the system resolver has already failed. */
const FALLBACK_DNS = ['1.1.1.1', '8.8.8.8'];

async function lookup(resolver, host) {
  const records = await resolver.resolveSrv('_mongodb._tcp.' + host);
  if (!records.length) throw new Error('SRV lookup returned no hosts for ' + host);

  // The TXT record carries defaults such as authSource and replicaSet. It is
  // optional in the spec, so a missing one is not an error.
  let options = '';
  try {
    const txt = await resolver.resolveTxt(host);
    options = txt.map((chunks) => chunks.join('')).join('&');
  } catch {
    options = '';
  }

  return { records, options };
}

/**
 * @returns {Promise<{uri: string, expanded: boolean, via: string | null}>}
 */
export async function expandSrvUri(uri) {
  if (!uri || !uri.startsWith('mongodb+srv://')) {
    return { uri, expanded: false, via: null };
  }

  const parsed = new URL(uri);
  const host = parsed.hostname;

  let found;
  let via = 'system resolver';
  try {
    found = await lookup(dns, host);
  } catch (systemError) {
    const resolver = new dns.Resolver();
    resolver.setServers(FALLBACK_DNS);
    try {
      found = await lookup(resolver, host);
      via = 'fallback resolver ' + FALLBACK_DNS.join(', ');
    } catch {
      // Report the system resolver's failure, not the fallback's - the fallback
      // is a workaround, and its error would send someone debugging the wrong
      // machine.
      throw systemError;
    }
  }

  // Expand even when the system resolver answered. This resolver has been seen
  // flapping - ten straight SERVFAILs, then a clean answer a minute later - so
  // handing the +srv URI back would just move the same lookup a few hundred
  // milliseconds later, into the driver, where a failure aborts startup. One
  // successful lookup here is enough for the whole process lifetime.

  const hosts = found.records.map((r) => r.name.replace(/\.$/, '') + ':' + r.port).join(',');

  // TXT options are defaults; anything spelled out in the URI wins.
  const params = new URLSearchParams(found.options);
  for (const [key, value] of new URLSearchParams(parsed.search)) params.set(key, value);
  // +srv implies TLS. The plain scheme does not, so it has to be stated or Atlas
  // will reject the connection.
  if (!params.has('tls') && !params.has('ssl')) params.set('tls', 'true');

  const credentials = parsed.username
    ? parsed.username + (parsed.password ? ':' + parsed.password : '') + '@'
    : '';
  // The spec requires the slash before the query string even when no default
  // database is named, so this is '/' rather than empty.
  const database = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '/';

  return {
    uri: 'mongodb://' + credentials + hosts + database + '?' + params.toString(),
    expanded: true,
    via,
  };
}
