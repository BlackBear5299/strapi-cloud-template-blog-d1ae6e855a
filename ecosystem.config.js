module.exports = {
  apps: [
    {
      name: 'moms-website-backend',
      cwd: __dirname,
      script: 'npm',
      args: 'start',
      env: { NODE_ENV: 'production' },
    },
  ],
};
