import simpleGit from 'simple-git';
import fs from 'fs/promises';
import { fetch } from 'undici';

const githubToken = process.env.GITHUB_TOKEN;
const discordToken = process.env.DISCORD_TOKEN;

const client = new Octokit({
    auth: githubToken
})

const activities = await fetch('https://discord.com/api/v9/activities/guilds/831646372519346186/config', {
    headers: {
        'Authorization': discordToken
    }
})

const files = [];
const app_ids = (await activities.json()).app_ids;
for (const appId of app_ids) {
    const assetsPromise = (await fetch(`https://canary.discord.com/api/v9/oauth2/applications/${appId}/assets`)).json();
    const assets = await assetsPromise;

    const image = await fetch(`https://cdn.discordapp.com/app-assets/${appId}/${assets.find((asset) => asset.name === 'embedded_cover').id}.png?size=1024`);
    const name = `./activities/${appId}.png`

    files.push(name);
    fs.writeFile(name, Buffer.from(await image.arrayBuffer()));
}

const pushFiles = async() => {
    const result = await git.status();
    if (result.files.length === 0) {
      console.log('No changes');
      return;
    }

    await git.add(files);
    await git.commit('Update activities 🚀');
    await git.push('origin', 'master');
}

pushFiles();