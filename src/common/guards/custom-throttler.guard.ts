import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const contextType = context.getType<string>();

    // Handle GraphQL context
    if (contextType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      return { req: ctx.req, res: ctx.res };
    }

    // Handle HTTP context
    const httpCtx = context.switchToHttp();
    return {
      req: httpCtx.getRequest(),
      res: httpCtx.getResponse(),
    };
  }

  // Extract tracker (IP address) from request
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Handle cases where req might be undefined
    if (!req) {
      return 'unknown';
    }

    // Try different ways to get the IP
    return (
      req.ips?.length > 0
        ? req.ips[0]
        : req.ip ||
          req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
          req.connection?.remoteAddress ||
          'unknown'
    );
  }
}
