import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Liveness endpoint for the hosting platform and for a quick manual check that
 * a deployment is actually up.
 *
 * It reports the database state but does not fail when the database is down:
 * a failing health check makes most platforms restart the container, and
 * restarting the API does not fix a Mongo outage — it just turns a degraded
 * service into a crash loop.
 */
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    // Mongoose readyState: 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
    const connected = this.connection.readyState === 1;

    return {
      status: 'ok',
      database: connected ? 'connected' : 'disconnected',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
