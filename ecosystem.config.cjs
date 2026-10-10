module.exports = {
  apps: [
    {
      name: 'lms-web',
      cwd: '/home/ubuntu/apps/lms-frontend/current',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
    },
  ],
};
