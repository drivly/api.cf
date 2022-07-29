import domains from './domains.json'

export default {
  scheduled: async (event, env, ctx) => {
    // loop through the domains, and ensure they are properly configured
    // if the zone doesn't exist, create it
    // if the @ doesn't have a CNAME to drivly.github.io, create it
    // if the * doesn't have a AAAA to 100::, create it
    // ensure MX records are properly set up
    // ensure worker routes are correct
    // if there are an issues around nameservers, send a slack message
  }
}
