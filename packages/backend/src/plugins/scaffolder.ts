import { createRouter } from '@backstage/plugin-scaffolder-backend';
import { actions } from './scaffolder/actions/register';

export default async function createPlugin({
  logger,
  config,
  discovery,
  database,
  catalogClient,
}: any) {
  return await createRouter({
    logger,
    config,
    discovery,
    database,
    catalogClient,
    actions,
  });
}
