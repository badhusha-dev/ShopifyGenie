const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sales Service API',
      version: '1.0.0',
      description: 'Sales Service REST API for Business Management Platform'
    },
    servers: [
      {
        url: 'http://localhost:6000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
