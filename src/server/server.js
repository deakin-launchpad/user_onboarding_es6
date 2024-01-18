import ServerHelper from "./helpers.js";
import SocketManager from "../lib/socketManager.js";
import SSOManager from "../lib/ssoManager.js";

/**
 * @author Sanchit Dang
 * @description Initilize HAPI Server
 */
const initServer = async () => {
  //Create Server
  const server = ServerHelper.createServer();

  //Register All Plugins
  await ServerHelper.registerPlugins(server);

  //add views
  await ServerHelper.addViews(server);

  //Default Routes
  ServerHelper.setDefaultRoute(server)

  SSOManager.createRoute(server);

  // Add routes to Swagger documentation
  ServerHelper.addSwaggerRoutes(server);

  // Bootstrap Application
  ServerHelper.bootstrap();

  SocketManager.connectSocket(server);

  ServerHelper.attachLoggerOnEvents(server);

  // Start Server
  ServerHelper.startServer(server);
}

/**
 * @author Sanchit Dang
 * @description Start HAPI Server
 */
export const startMyServer = () => {

  ServerHelper.configureLog4js();

  ServerHelper.connectMongoDB();

  // Global variable to get app root folder path
  ServerHelper.setGlobalAppRoot();

  process.on("unhandledRejection", err => {
    appLogger.fatal(err);
    process.exit(1);
  });

  initServer();
}
