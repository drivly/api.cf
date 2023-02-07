import { Router } from 'itty-router'
import { withParams } from 'itty-router-extras'

const router = Router()

const api = {
  icon: '⚡️☁️',
  name: 'api.cf',
  description: 'Cloudflare API',
  url: 'https://api.cf',
  api: 'https://api.cf/api',
  endpoints: {
    cf: 'https://api.cf',
    zones: 'https://api.cf/zones',
  },
  type: 'https://apis.do/integrations',
  repo: 'https://github.com/drivly/api.cf',
}

router.all('*', async (req, env) => {
  const { searchParams } = new URL(req.url)
  if (!searchParams.has('test')) {
    const { user } = await env.CTX.fetch(req).then(res => res.json())
    req.user = user
  }
})

router.get('/', ({ cf, headers, user }) => json({ api, cf, headers: Object.fromEntries(headers), user }))

router.get('/whois/:domain', withParams, async ({ domain, user }, { account, CF_TOKEN }) => {
  const data = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/intel/whois?domain=${domain}`, { headers: { Authorization: 'Bearer ' + CF_TOKEN } }).then(res => res.json())
  return json({ api, domain, data, user })
})


router.get('/trace/:domain', withParams, async ({ domain, user }, { account, CF_TOKEN }) => {
  const data = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/diagnostics/traceroute`, { method: 'post', body: JSON.stringify([domain]), headers: { Authorization: 'Bearer ' + CF_TOKEN } }).then(res => res.json())
  return json({ api, domain, data, user })
})


router.get('/ip/:ipv4', withParams, async ({ ipv4, user }, { account, CF_TOKEN }) => {
  const data = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/intel/ip?ipv4=${ipv4}`, { headers: { Authorization: 'Bearer ' + CF_TOKEN } }).then(res => res.json())
  return json({ api, ipv4, data, user })
})


router.get('/asn/:asn', withParams, async ({ asn, user }, { account, CF_TOKEN }) => {
  const data = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/intel/asn/${asn}`, { headers: { Authorization: 'Bearer ' + CF_TOKEN } }).then(res => res.json())
  return json({ api, asn, data, user })
})
///intel/ip-list


router.get('/intel', withParams, async ({ user }, { account, CF_TOKEN }) => {
  const data = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/intel/ip-list`, { headers: { Authorization: 'Bearer ' + CF_TOKEN } }).then(res => res.json())
  return json({ api, data, user })
})

router.get('/zones', withParams, async ({ user, url }, { account = 'b6641681fe423910342b9ffa1364c76d', CF_TOKEN }) => {
  const { searchParams } = new URL(url)
  const limit = 50
  const page = parseInt(searchParams.get('page') ?? 1)
  const data = await fetch(`https://api.cloudflare.com/client/v4/zones?per_page=${limit}&page=${page}&account.id=${account}`, { headers: { Authorization: 'Bearer ' + CF_TOKEN } }).then(res => res.json())
//   const data = await fetch(`https://api.cloudflare.com/client/v4/zones?per_page=${limit}&page=${page}`, { headers: { Authorization: 'Bearer ' + CF_TOKEN } }).then(res => res.json())
  const zones = data.result.map(({ name, id }) => ({ id, name, url: 'https://' + name }))
  const links = {
    self: url,
    first: 'https://api.cf/zones?page=1',
    next: data.result.length == limit ? 'https://api.cf/zones?page=' + (page + 1) : undefined,
    prev: page > 1 ? 'https://api.cf/zones?page=' + (page - 1) : undefined,
  }
  return json({ api, links, zones, data, user })
})

router.get('/:resource/:id?', withParams, async ({ resource, id, user }) => {
  return json({ api, resource, id, user })
})

function json(body, options = {}) {
  const { headers = {}, ...rest } = options
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
    ...rest,
  })
}


export default {
  fetch: router.handle
}


// import domains from './domains.json'
// export default {
//   fetch: (event, env, ctx) => {
//     // TODO
//     // Login & Authorize via the Cloudflare Tenant API
//     // https://developers.cloudflare.com/tenant/get-started/prerequisites/
//   }
//   scheduled: async (event, env, ctx) => {
//     // TODO
//     // loop through the domains, and ensure they are properly configured
//     // if the zone doesn't exist, create it
//     // if the @ doesn't have a CNAME to drivly.github.io, create it
//     // if a github repo of the same name in the drivly org doesn't exist, create it
//     // if the * doesn't have a AAAA to 100::, create it
//     // ensure MX records are properly set up
//     // ensure worker routes are correct
//     // if there are an issues around nameservers, send a slack message
//   }
// }
