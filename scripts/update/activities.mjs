import path from 'node:path';
import fs from 'node:fs/promises';
import { fetch } from 'undici';
import { existSync } from '../utils/existSync.mjs';
import { pushFiles } from '../utils/pushFiles.mjs';
import { markdownTable } from 'markdown-table';

const discordToken = process.env.DISCORD_TOKEN;

const appIds = (await (await fetch('https://discord.com/api/v10/activities/guilds/831646372519346186/shelf', {
    headers: {
        'Authorization': discordToken
    }
})).json()).activity_bundle_items.map(app => app.application_id);

if (!(await existSync())) await fs.mkdir(`${path.resolve('..')}/activities/`);

const activities = [];
const files = [`${path.resolve('..')}/activities/activities.json`, `${path.resolve('..')}/activities/README.md`];

for (const appId of appIds) {
    const applicationInfo = await (await fetch(`https://canary.discord.com/api/v9/oauth2/authorize?client_id=${appId}`, {
        headers: {
            'Authorization': discordToken
        }
    })).json();

    const assets = await (await fetch(`https://canary.discord.com/api/v9/oauth2/applications/${appId}/assets`)).json();

    const image = await fetch(`https://cdn.discordapp.com/app-assets/${appId}/${assets.find((asset) => asset.name === 'embedded_cover').id}.png?size=1024`);
    const nameImage = `${path.resolve('..')}/activities/${appId}.png`;
    const nameInfo = `${path.resolve('..')}/activities/${appId}.json`;

    activities.push({
        id: appId,
        name: applicationInfo.application?.name,
        icon: applicationInfo.application?.icon,
        description: applicationInfo.application?.description,
        activity_config: applicationInfo.application.embedded_activity_config
    });

    files.push(nameInfo);
    files.push(nameImage);

    fs.writeFile(
        nameInfo,
        JSON.stringify(
            {
                id: appId,
                name: applicationInfo.application?.name,
                description: applicationInfo.application?.description,
                icon: applicationInfo.application?.icon,
            },
            null,
            4
        )
    );

    fs.writeFile(nameImage, Buffer.from(await image.arrayBuffer()).toString('base64'), 'base64');
    console.log(`Activity ${applicationInfo.application?.name} (${appId}) updated. 🚀`);
}

fs.writeFile(`${path.resolve('..')}/activities/activities.json`, JSON.stringify(activities, null, 4));
fs.writeFile(`${path.resolve('..')}/activities/README.md`, markdownTable(
    [
        ['Application Id', 'Application Name', 'Application Description', 'Application Icon', 'Image'],
        ...activities.map((activity) => [activity.id, activity.name, activity.description, activity.icon, `[${activity.name}](./${activity.id}.png)`])
    ]
))

pushFiles(files, 'activities');
