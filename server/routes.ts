import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import apiRoutes from "./api-routes/index";
import { connectDatabase } from "./config/database";
import { connectRedis } from "./config/redis";
import { initializeWebSocket } from "./websocket/socketServer";
import { log } from "./index";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  try {
    await connectDatabase();
    log('Database connected', 'setup');

    await connectRedis();
    log('Redis connected', 'setup');

    initializeWebSocket(httpServer);
    log('WebSocket initialized', 'setup');

    app.use('/api', apiRoutes);
    log('API routes registered', 'setup');

  } catch (error) {
    console.error('Failed to initialize backend services:', error);
  }

  return httpServer;
}
