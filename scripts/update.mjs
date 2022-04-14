import { Octokit as RawOctokit } from "octokit";
import plugin from "octokit-commit-multiple-files";
import { fetch } from "undici";

const Octokit = RawOctokit.plugin(plugin());

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

const files = {};
const app_ids = (await activities.json()).app_ids;
for (const appId of app_ids) {
    const assetsPromise = (await fetch(`https://canary.discord.com/api/v9/oauth2/applications/${appId}/assets`)).json();
    const assets = await assetsPromise;

    const image = await fetch(`https://cdn.discordapp.com/app-assets/${appId}/${assets.find((asset) => asset.name === 'embedded_cover').id}.png?size=1024`);
    const base64 = Buffer.from(await image.arrayBuffer()).toString('base64');

    files[`activities/${appId}.png`] = {
        contents: base64
    }
}

client.repos.createOrUpdateFiles({
    owner: 'xHyroM',
    repo: 'discord-activities',
    branch: 'master',
    changes: [
        {
            message: 'Activities update 🚀',
            files
        }
    ]
})