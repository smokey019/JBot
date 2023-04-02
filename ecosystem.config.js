module.exports = {
  apps: [
    {
      name: "JBot",
      script: "node ./index.js",
      cwd: "/home/ec2-user/dist/",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
