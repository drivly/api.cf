import { Router } from 'itty-router'
import { json, withParams } from 'itty-router-extras'
import camelcaseKeys from 'camelcase-keys'

const router = Router()

const api = {
  icon: '⚡️☁️',
  name: 'api.cf',
  description: 'Cloudflare API',
  url: 'https://api.cf',
  api: 'https://api.cf/api',
  endpoints: {
    ip: 'https://api.cf/ip/:ip',
    asn: 'https://api.cf/ip/:asn',
    domain: 'https://api.cf/ip/:domain',
  },
  type: 'https://apis.do/integrations',
  repo: 'https://github.com/drivly/api.cf',
}

router.all('*', async (req, env, ctx) => {
  const {user} = await env.CTX.fetch(req).then(res => res.json())
  req.user = user
})

router.get('/', ({cf, headers, user}) => json({ api, cf, headers: Object.fromEntries(headers), user }))

router.get('/whois/:domain', withParams, async ({domain},{account, CF_TOKEN}) => {
  const data = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/intel/whois?domain=${domain}`, { headers: { authorization: 'Bearer ' + CF_TOKEN }}).then(res => res.json())
  return json({api, domain, data, user })
})

router.get('/:resource/:id?', withParams, async ({resource, id, user}) => {
  return json({api, resource, id, user })
})


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
