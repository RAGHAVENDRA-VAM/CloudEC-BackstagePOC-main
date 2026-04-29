import { createRouter } from '@backstage/plugin-scaffolder-backend';
import { actions } from './actions/register';

export default async function createPlugin({
  logger,
  config,
  discovery,
  tokenManager,
  database,
  catalogClient,
}: PluginEnvironment) {
  return await createRouter({
    logger,
    config,
    discovery,
    tokenManager,
    database,
    catalogClient,
    actions,
  });
}
