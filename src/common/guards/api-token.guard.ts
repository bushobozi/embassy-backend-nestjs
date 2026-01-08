import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-api-token'] || request.query.token;

    const validToken = this.configService.get<string>('PUBLIC_API_TOKEN');

    if (!token || token !== validToken) {
      throw new UnauthorizedException('Invalid or missing API token');
    }

    return true;
  }
}
