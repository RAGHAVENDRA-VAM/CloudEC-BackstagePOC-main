import { createRouter } from '@backstage/plugin-scaffolder-backend';
import { actions } from './scaffolder/register';

export default async function createPlugin({
  logger,
  config,
  discovery,
  database,
  reader,
  catalogClient,
}: any) {
  return await createRouter({
    logger,
    config,
    discovery,
    database,
    reader,
    catalogClient,
    actions,
  });
}
