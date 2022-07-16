import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { existSync } from './utils/existSync.js';
import { pushFiles } from './utils/pushFiles.js';
import { markdownTable } from 'markdown-table';

const discordToken: string = process.env.DISCORD_TOKEN as string;

const appIds: any = (await (await fetch('https://discord.com/api/v10/activities/guilds/831646372519346186/shelf', {
    headers: {
        'Authorization': discordToken
    }
})).json() as any).activity_bundle_items.map(app => app.application_id) as any;

if (!existSync()) await mkdirSync(`${resolve('..')}/activities/`);

const activities: any[] = [];
const files = [`${resolve('..')}/activities.json`, `${resolve('..')}/activities.md`];

for (const appId of appIds) {
    const applicationInfo: any = await (await fetch(`https://canary.discord.com/api/v9/oauth2/authorize?client_id=${appId}`, {
        headers: {
            'Authorization': discordToken
        }
    })).json() as any;

    const assets: any = await (await fetch(`https://canary.discord.com/api/v9/oauth2/applications/${appId}/assets`)).json();

    const image = await fetch(`https://cdn.discordapp.com/app-assets/${appId}/${assets.find((asset) => asset.name === 'embedded_cover').id}.png?size=1024`);
    const nameImage = `${resolve('..')}/activities/${appId}.png`;
    const nameInfo = `${resolve('..')}/activities/${appId}.json`;

    activities.push({
        id: appId,
        name: applicationInfo.application?.name,
        icon: applicationInfo.application?.icon,
        description: applicationInfo.application?.description,
        activity_config: applicationInfo.application.embedded_activity_config
    });

    files.push(nameInfo);
    files.push(nameImage);

    Bun.write(
        nameInfo,
        JSON.stringify(
            {
                id: appId,
                name: applicationInfo.application?.name,
                description: applicationInfo.application?.description,
                icon: applicationInfo.application?.icon,
                activity_config: applicationInfo.application.embedded_activity_config
            },
            null,
            4
        )
    );

    Bun.write(nameImage, await image.blob());
    console.log(`Activity ${applicationInfo.application?.name} (${appId}) updated. 🚀`);
}

Bun.write(`${resolve('..')}/activities.json`, JSON.stringify(activities, null, 4));
Bun.write(`${resolve('..')}/activities.md`, markdownTable(
    [
        ['Application Id', 'Application Name', 'Premium Tier', 'Application Description', 'Application Icon', 'Image'],
        ...activities.map((activity) => [activity.id, activity.name, activity.activity_config.activity_premium_tier_level, activity.description, activity.icon, `[${activity.name}](./activities/${activity.id}.png)`])
    ]
))

pushFiles(files);
