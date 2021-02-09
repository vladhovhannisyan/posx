try {
  const express = require('express');
  const app = express();
  const expressSwagger = require('express-swagger-generator')(app);
  const swaggerOptions = require('../config/swaggerOptions');
  const swaggerDocs = expressSwagger(swaggerOptions);
  const fs = require('fs');
  const path = require('path');
  const swaggerFilePath = path.join(__dirname, '../config/swagger.json');
  fs.writeFileSync(swaggerFilePath, JSON.stringify(swaggerDocs, null, 2));
  console.log(`Swagger docs generated, can be found in ${swaggerFilePath}`);
}
catch (e) {
  console.log('Error generating swagger docs', e);
}