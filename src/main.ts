import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';

interface JwtPayload {
  role: string;
  [key: string]: any;
}

async function createApp() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });

  app.use(express.json({ limit: '70mb' }));
  app.use(express.urlencoded({ limit: '70mb', extended: true }));

  // Enable CORS for cross-origin requests
  const allowedOrigins =
    process.env.VITE_HOSTS?.split(',').map((origin) =>
      origin.trim().replace(/\/$/, ''),
    ) || [];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or Postman)
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

  // Add global prefix for all routes
  app.setGlobalPrefix('api/v1');

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
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controllers.
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = 'swagger_docs/embassy';
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith(`/api/v1/${swaggerPath}`)) {
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

      console.log('JWT Payload:', payload);
      console.log('Role:', payload.role);
      if (payload.role !== 'super_admin') {
        console.log('Access denied - role is not super_admin');
        return res.status(403).json({
          statusCode: 403,
          message: 'Access denied.',
        });
      }

      console.log('Access granted - super_admin detected');
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

  SwaggerModule.setup(`api/v1/${swaggerPath}`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Embassy System API Docs',
  });

  await app.init();
  return app;
}

// Cache Nest HTTP server between Vercel invocations
let cachedServer: any;

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const app = await createApp();
    cachedServer = app.getHttpAdapter().getInstance();
  }

  return cachedServer(req, res);
}

// Local / non-Vercel environment: start a regular HTTP server
if (!process.env.VERCEL) {
  createApp()
    .then((app) => app.listen(process.env.PORT ?? 3000))
    .catch((err) => {
      console.error('Error starting app:', err);
      process.exit(1);
    });
}
