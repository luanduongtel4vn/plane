import dotenv from "dotenv";
import path from "path";
import express from "express";
import { Server } from "@overnightjs/core";
import cors from "cors";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
// controllers
import * as controllers from "./controllers";
// middlewares
import loggerMiddleware from "./middlewares/logger.middleware";
// utils
import { logger } from "./utils/logger";


class ApiServer extends Server {
  private readonly SERVER_STARTED = "Api server started on port: ";
  SERVER_PORT: number;

  constructor() {
    super(true);
    // disabling overnight logs
    this.showLogs = false;
    // enabling env variable from .env file
    dotenv.config();
    // assigning port
    this.SERVER_PORT = process.env.SERVER_PORT
      ? parseInt(process.env.SERVER_PORT, 10)
      : 8080;
    // logger
    this.app.use(loggerMiddleware);
    // exposing public folder for static files.
    this.app.use(express.static("public"));
    // body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    // views engine
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "hbs");
    // cors
    this.app.use(cors());
    // sentry setup
    if (
      process.env.APP_ENV === "staging" ||
      process.env.APP_ENV === "production"
    ) {
      // setting up error logging and tracing.
      this.setupSentryInit();
    }
    // setting up controllers
    this.setupControllers();
    // setting up sentry error handling
    this.sentryErrorHandling();
  }

  public getAppInstance() {
    return this.app;
  }

  private setupControllers(): void {
    const controllerInstances = [];
    for (const name in controllers) {
      if (Object.prototype.hasOwnProperty.call(controllers, name)) {
        const Controller = (controllers as any)[name];
        controllerInstances.push(new Controller());
      }
    }
    super.addControllers(controllerInstances);
  }

  private setupSentryInit() {
    Sentry.init({
      dsn: "",
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app: this.app }),
      ],
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });

    // RequestHandler creates a separate execution context using domains, so that every
    // transaction/span/breadcrumb is attached to its own Hub instance
    this.app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    this.app.use(Sentry.Handlers.tracingHandler());
  }

  private sentryErrorHandling() {
    // The error handler must be before any other error middleware and after all controllers
    this.app.use(Sentry.Handlers.errorHandler());

    this.app.use(function onError(req, res: any) {
      // The error id is attached to `res.sentry` to be returned
      // and optionally displayed to the user for support.
      res.statusCode = 500;
      res.end(res.sentry + "\n");
    });
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      logger.info(this.SERVER_STARTED + port);
    });
  }
}

export default ApiServer;
