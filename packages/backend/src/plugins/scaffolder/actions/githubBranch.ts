import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { Octokit } from '@octokit/rest';

export const githubBranchAction = createTemplateAction({
  id: 'github:branch',
  schema: {
    input: {
      type: 'object',
      required: ['repoUrl', 'branchName'],
      properties: {
        repoUrl: {
          type: 'string',
          description: 'The repository URL',
        },
        branchName: {
          type: 'string',
          description: 'The name of the branch to create',
        },
      },
    },
  },
  async handler(ctx) {
    const { repoUrl, branchName } = ctx.input;
    const octokit = new Octokit({ auth: ctx.secrets.githubToken });

    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');
    const { data: defaultBranch } = await octokit.repos.get({
      owner,
      repo,
    });

    const defaultBranchRef = `refs/heads/${defaultBranch.default_branch}`;

    // Create the new branch
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: defaultBranch.commit.sha,
    });

    ctx.logger.info(`Branch ${branchName} created successfully in ${repoUrl}`);
  },
});
