import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CacheManager,
  useCacheManager,
  MemoryLRUStrategy,
  MemoryTTLStrategy,
  // RedisStrategy,
} from '@jhadechine/cachealo';
// import Redis from 'ioredis';

export const CACHEALO_MANAGER = Symbol('CACHEALO_MANAGER');

@Global()
@Module({
  providers: [
    {
      provide: CACHEALO_MANAGER,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const manager = new CacheManager({
          keyPrefix: cfg.get('cache.prefix') ?? 'notes:',
          defaultTtl: cfg.get('cache.ttl') ?? 30000,
          layers: [
            new MemoryLRUStrategy(1000, 'lru'),
            new MemoryTTLStrategy('ttl'),
            // cfg.get('REDIS_URL') ? new RedisStrategy(new Redis(cfg.get('REDIS_URL')!), 'rm:', 'redis') : undefined,
          ].filter(Boolean) as any[],
        });
        useCacheManager(manager);
        return manager;
      },
    },
  ],
  exports: [CACHEALO_MANAGER],
})
export class CachealoNestModule {}
