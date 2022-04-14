import simpleGit from 'simple-git';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fetch } from 'undici';
import { constants } from 'node:fs';

const discordToken = process.env.DISCORD_TOKEN;
const git = simpleGit({ baseDir: path.resolve('..') });

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

const existSync = async() => {
    try {
        await fs.access('./activities/', constants.R_OK | constants.W_OK);
        return true;
    } catch {
        return false;
    }
}

const activities = await fetch('https://discord.com/api/v9/activities/guilds/831646372519346186/config', {
    headers: {
        'Authorization': discordToken
    }
})

if (!(await existSync())) await fs.mkdir('./activities/')

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

pushFiles();