const fs = require('fs');
const path = require('path');

function autoLoadRoutes(app, routesPath = './routes') {
  const absolutePath = path.resolve(routesPath);
  const availableEndpoints = [];
  fs.readdirSync(absolutePath).forEach((file) => {
    if (file.endsWith('.js')) {
      const routePath = path.join(absolutePath, file);
      const route = require(routePath);
      const routeName = path.basename(file, '.js');
      const routePrefix = routeName === 'index' ? '/' : `/${routeName}`;
      if (route.stack) {
        route.stack.forEach((layer) => {
          if (layer.route) {
            const methods = Object.keys(layer.route.methods).map((method) => method.toUpperCase());
            const path = layer.route.path;
            availableEndpoints.push({
              method: methods.join(', '),
              path: routePrefix === '/' && path === '/' ? '/' : `${routePrefix}${path}`,
            });
          }
        });
      }
      app.use(routePrefix, route);
      console.log(`Loaded route: ${routePrefix} from ${file}`);
    }
  });
  return availableEndpoints;
}

module.exports = autoLoadRoutes;