import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LinkedInAuthGuard extends AuthGuard('linkedin') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const result = super.canActivate(context);
    
    // If it's an Observable, add error handling
    if (result instanceof Observable) {
      return result.pipe(
        catchError((err) => {
          console.error('[LinkedInAuthGuard] Error during OAuth:', {
            message: err?.message,
            stack: err?.stack,
            name: err?.name,
          });
          // Re-throw to be handled by NestJS exception filter
          return throwError(() => err);
        })
      );
    }
    
    // If it's a Promise, add error handling
    if (result instanceof Promise) {
      return result.catch((err) => {
        console.error('[LinkedInAuthGuard] Error during OAuth:', {
          message: err?.message,
          stack: err?.stack,
          name: err?.name,
        });
        throw err;
      });
    }
    
    // If it's a boolean, return as is
    return result;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's an error or no user, log it but don't throw here
    // Let the controller handle it
    if (err) {
      console.error('[LinkedInAuthGuard] Authentication error:', {
        err: err?.message || err,
        info: info?.message || info,
      });
      // Store error in request for controller to handle
      const request = context.switchToHttp().getRequest();
      request.linkedinAuthError = err;
    }
    // Return user (or undefined if auth failed)
    return user;
  }
}

