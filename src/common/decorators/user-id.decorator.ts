import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    
    // Try to get from request.user first (set by JWT strategy)
    if (request.user) {
      const user = request.user as any;
      if (user._id) {
        return typeof user._id === 'string' ? user._id : user._id.toString();
      }
      if (user.id) {
        return typeof user.id === 'string' ? user.id : user.id.toString();
      }
    }
    
    // Extract from token payload in request (set by JWT strategy)
    // The JWT strategy validates the token and sets request.user
    // If user is not set, try to decode token manually
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Decode without verification (just to get payload)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          Buffer.from(base64, 'base64')
            .toString()
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''),
        );
        const payload = JSON.parse(jsonPayload);
        if (payload && payload.sub) {
          return payload.sub;
        }
      } catch (error) {
        // Token decode failed
      }
    }
    
    throw new Error('User ID not found in token or request');
  },
);

