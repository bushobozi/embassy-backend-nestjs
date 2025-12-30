import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { Express, Request, Response, NextFunction } from 'express';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

let cachedServer: Express | null = null;

async function bootstrap(): Promise<Express> {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, {
      bodyParser: true,
      rawBody: true,
    });

    // Increase body size limit for file uploads
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Enable CORS
    const allowedOrigins =
      process.env.VITE_HOSTS?.split(',').map((origin) =>
        origin.trim().replace(/\/$/, ''),
      ) || [];

    app.enableCors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log('Blocked origin:', origin);
          console.log('Allowed origins:', allowedOrigins);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Add global prefix
    app.setGlobalPrefix('api/v1');

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('Embassy System MVP API')
      .setDescription(
        'The Embassy System API description - Minimum Viable Product API',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const swaggerPath = 'swagger_docs/embassy';

    // JWT middleware for Swagger
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (!req.path.includes(swaggerPath)) {
        return next();
      }
      if (
        req.path.includes('.css') ||
        req.path.includes('.js') ||
        req.path.includes('.png') ||
        req.path.includes('.ico') ||
        req.path.includes('swagger-ui') ||
        req.path.includes('favicon') ||
        req.path.includes('oauth2-redirect.html') ||
        req.path.includes('-json')
      ) {
        return next();
      }
      let token: string | undefined;
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (req.query.token) {
        token = req.query.token as string;
      }

      if (!token) {
        res.setHeader(
          'WWW-Authenticate',
          'Bearer realm="Swagger Documentation"',
        );
        return res.status(403).json({
          statusCode: 403,
          message: 'Access denied',
        });
      }

      try {
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
          throw new Error('JWT secret not configured');
        }
        const payload = jwt.verify(token, secret) as JwtPayload;

        if (payload.role !== 'super_admin') {
          return res.status(403).json({
            statusCode: 403,
            message: 'Access denied.',
          });
        }

        next();
      } catch (error) {
        console.error('JWT verification error:', error);
        res.setHeader(
          'WWW-Authenticate',
          'Bearer realm="Swagger Documentation"',
        );
        return res.status(403).json({
          statusCode: 403,
          message: 'Access denied.',
        });
      }
    });

    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'Embassy System API Docs',
      explorer: true,
    });

    await app.init();
    cachedServer = app.getHttpAdapter().getInstance() as Express;
  }

  return cachedServer;
}

export default async (req: Request, res: Response): Promise<void> => {
  try {
    const server = await bootstrap();
    server(req, res, () => {});
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
