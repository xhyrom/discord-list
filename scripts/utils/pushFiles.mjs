import simpleGit from 'simple-git';
import path from 'node:path';
const git = simpleGit({ baseDir: path.resolve('..') });

export const pushFiles = async(files) => {
    const result = await git.status();
    if (result.files.length === 0) {
      console.log('No changes');
      return;
    }

    await git.add(files);
    await git.commit('Update activities 🚀');
    await git.push('origin', 'master');
}
