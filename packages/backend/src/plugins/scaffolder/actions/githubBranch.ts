import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { Octokit } from '@octokit/rest';

export const githubBranchAction: any = createTemplateAction({
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
    const { repoUrl, branchName } = ctx.input as { repoUrl: string; branchName: string };
    
    if (!ctx.secrets || !ctx.secrets.githubToken) {
      throw new Error('GitHub token is not configured');
    }
    
    const octokit = new Octokit({ auth: ctx.secrets.githubToken });

    const repoPath = String(repoUrl).replace('https://github.com/', '');
    const [owner, repo] = repoPath.split('/');
    
    // Get repository to find the default branch
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });
    
    // Get the default branch details to get commit SHA
    const { data: defaultBranchData } = await octokit.repos.getBranch({
      owner,
      repo,
      branch: repoData.default_branch,
    });

    // Create the new branch
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: defaultBranchData.commit.sha,
    });

    ctx.logger.info(`Branch ${branchName} created successfully in ${repoUrl}`);
  },
});
