const withTM = require('next-transpile-modules')(['ui'])

module.exports = withTM({
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/auth/login',
  //       permanent: true
  //     }
  //   ]
  // },
  reactStrictMode: true
})
