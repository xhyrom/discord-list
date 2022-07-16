import simpleGit from 'simple-git';
import { resolve } from 'node:path';
const git = simpleGit({ baseDir: resolve('..') });

export const pushFiles = async(files): Promise<void> => {
    const result = await git.status();
    if (result.files.length === 0) {
      console.log('No changes');
      return;
    }

    await git.add(files);
    await git.commit('Update activities 🚀');
    await git.push('origin', 'master');
}
