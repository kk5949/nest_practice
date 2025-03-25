
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 요청과 응답에 대한 응답시간과 소요시간을 출력
    //[REQ] {요청path} {요청시간}
    //[RES] {요청path} {응답시간} {소요시간ms}

    const req = context.switchToHttp().getRequest();
    const path = req.url;
    const now = Date.now();

    // 요청시간을 yyyy-MM-dd HH:mm:ss 형식으로 출력
    console.log(`[REQ] ${path} ${now.toLocaleString()}`);

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(`[RES] ${path} ${new Date().toLocaleTimeString()} ${Date.now() - now}ms`),
        )
        // ,map((data)=>{
        //   return {
        //     data: data,
        //     statusCode: 200
        //   }
        // })
      );
  }
}
