module.exports = {
  apps: [
    {
      script: 'dist/apps/dni-service/main.js',
      watch: '',
      args: '',
      instances: 4,
      name: 'dni-service',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      node_args: "--max_old_space_size=8192",
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      script: 'dist/apps/history-service/main.js',
      watch: '',
      args: '',
      instances: 1,
      name: 'dni-history-service',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      script: 'dist/apps/event-service/main.js',
      watch: '',
      args: '',
      instances: 2,
      name: 'dni-event-service',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      node_args: "--max_old_space_size=8192",
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      script: 'dist/apps/sync-service/main.js',
      watch: '',
      args: '',
      instances: 1,
      name: 'dni-sync-service',
      node_args: "--max_old_space_size=8192",
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
  deploy: {
    production: {
      user: 'node',
      host: '0.0.0.1',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
    development: {
      user: 'node',
      host: '0.0.0.1',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env development',
      'pre-setup': '',
    },
  },
};
