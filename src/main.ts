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

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });

  // Increase body size limit for file uploads (default is 100kb)
  // This allows up to 50MB for profile pictures and other uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: process.env.VITE_HOSTS?.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Add global prefix for all routes
  const GLOBAL_PREFIX = 'api/v1';
  app.setGlobalPrefix(GLOBAL_PREFIX);

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

  // Swagger path configuration - will be at /api/v1/
  const swaggerFullPath = `/${GLOBAL_PREFIX}`;

  // Set up Swagger FIRST (before authentication middleware)
  SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Embassy System API Docs',
  });

  // Add authentication middleware AFTER Swagger setup
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Normalize path by removing trailing slash for comparison
    const normalizedPath = req.path.replace(/\/$/, '');

    if (!normalizedPath.startsWith(swaggerFullPath)) {
      return next();
    }

    // Allow static assets through without authentication
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

    console.log('Swagger auth check - path:', req.path);
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      res.setHeader('WWW-Authenticate', 'Bearer realm="Swagger Documentation"');
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
      res.setHeader('WWW-Authenticate', 'Bearer realm="Swagger Documentation"');
      return res.status(403).json({
        statusCode: 403,
        message: 'Access denied.',
      });
    }
  });

  await app.listen(process.env.PORT ?? 3000);
}

// Cached server instance for Vercel serverless
let cachedServer: express.Express | null = null;

async function getServerlessApp() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, {
      bodyParser: true,
      rawBody: true,
    });

    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    app.enableCors({
      origin: process.env.VITE_HOSTS?.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

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
        'JWT-auth',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const swaggerPath = 'swagger_docs/embassy';
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
    });

    await app.init();
    cachedServer = app.getHttpAdapter().getInstance() as express.Express;
  }

  return cachedServer;
}

// For local development - start immediately
if (!process.env.VERCEL) {
  void bootstrap();
}

// Export handler for Vercel serverless
export default async (req: express.Request, res: express.Response) => {
  try {
    const server = await getServerlessApp();
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
