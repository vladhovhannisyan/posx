module.exports = {
  route: {
    url: '/api/api-docs',
    docs: '/api/api-docs.json',
  },
  swaggerDefinition: {
    info: {
      title: 'hikeup Service API',
      description: 'hikeup Service API documentation',
      version: '1.0.0',
    },
    host: 'cloudkitchens.locadomain:8015',
    basePath: '/api',
    produces: [
      "application/json"
    ],
    consumes: [
      "application/json"
    ],
    schemes: ['http']
  },
  basedir: __dirname, //app absolute path
  files: ['../*.js', '../validator/*.js', '../routes/*.js', '../controllers/*.js', '../utils/*.js'] //Path to the API handle folder
};