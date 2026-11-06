import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerStorage } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { Environment } from '../config/environment';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';
import { ExperienceModule } from '../experience/experience.module';
import { ProfileModule } from '../profile/profile.module';
import { ProjectModule } from '../project/project.module';
import { SkillModule } from '../skill/skill.module';
import { DataLoaderFactory, type GraphqlContext } from './dataloader.factory';
import { fullProfileQuery } from './full-profile-query';
import { operationLimitsRule } from './operation-limits.rule';
import { formatGraphqlError } from './format-error';
import { enforceGraphqlRateLimit } from './rate-limit';

@Module({
  imports: [ProfileModule, SkillModule, ExperienceModule, ProjectModule],
  providers: [DataLoaderFactory],
  exports: [DataLoaderFactory],
})
class LoadersModule {}

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [LoadersModule, ThrottlerModule.forRoot([])],
      inject: [DataLoaderFactory, ConfigService, ThrottlerStorage],
      useFactory: async (
        factory: DataLoaderFactory,
        config: ConfigService<Environment, true>,
        storage: ThrottlerStorage,
      ): Promise<ApolloDriverConfig> => {
        const { ApolloServerPluginLandingPageLocalDefault } =
          await import('@apollo/server/plugin/landingPage/default');
        // Apollo 5 forwards this whole state, but its inline type only lists headers/polling.
        const sandboxInitialState = {
          document: fullProfileQuery,
          variables: { slug: 'denis-mozhayskiy' },
          sharedHeaders: { 'Apollo-Require-Preflight': 'true' },
        };
        return {
          path: '/graphql',
          autoSchemaFile: join(process.cwd(), 'schema.gql'),
          sortSchema: true,
          playground: false,
          introspection: true,
          csrfPrevention: true,
          validationRules: [operationLimitsRule],
          includeStacktraceInErrorResponses: false,
          formatError: formatGraphqlError(
            config.get('NODE_ENV', { infer: true }) === 'production',
          ),
          plugins: [
            ApolloServerPluginLandingPageLocalDefault({
              embed: {
                initialState: sandboxInitialState,
              },
              includeCookies: false,
            }),
          ],
          context: async ({
            req,
            res,
          }: {
            req: Request;
            res: Response;
          }): Promise<GraphqlContext> => {
            await enforceGraphqlRateLimit(storage, req, res);
            return { req, res, loaders: factory.create() };
          },
        };
      },
    }),
  ],
})
export class ApiGraphqlModule {}
