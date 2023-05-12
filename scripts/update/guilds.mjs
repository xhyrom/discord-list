import path from 'node:path';
import fs from 'node:fs/promises';
import fetch from 'node-fetch';
import { pushFiles } from '../utils/pushFiles.mjs';
import { existSync } from '../utils/existSync.mjs';

if (!(await existSync(`${path.resolve('..')}/guilds/`))) await fs.mkdir(`${path.resolve('..')}/guilds/`);
fs.copyFile(`${path.resolve('..')}/guilds/README.template.md`, `${path.resolve('..')}/guilds/README.md`);

const discordToken = process.env.DISCORD_TOKEN;
const limit = 48;
let offset = 0;
let page = 0;

const writeGuild = async(server) => {
    if (!(existSync(`${path.resolve('..')}/guilds/${server.id}`))) await fs.mkdir(`${path.resolve('..')}/guilds/${server.id}`);

    const icon = server.icon ? await fetch(`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.webp?size=1024`).catch(() => {}) : { arrayBuffer: () => 'null' };
    const banner = server.banner ? await fetch(`https://cdn.discordapp.com/banners/${server.id}/${server.banner}.webp?size=1024`).catch(() => {}) : { arrayBuffer: () => 'null' };
    const splash = server.discovery_splash ? await fetch(`https://cdn.discordapp.com/discovery-splashes/${server.id}/${server.discovery_splash}.webp?size=1024`).catch(() => {}) : { arrayBuffer: () => 'null' };

    const nameIcon = `${path.resolve('..')}/guilds/${server.id}/icon.webp`;
    const nameBanner = `${path.resolve('..')}/guilds/${server.id}/banner.webp`;
    const nameSplash = `${path.resolve('..')}/guilds/${server.id}/splash.webp`;
    const nameInfo = `${path.resolve('..')}/guilds/${server.id}/info.json`;

    fs.writeFile(
        nameInfo,
        JSON.stringify(
            {
                id: server.id,
                name: server.name,
                description: server.description,
                icon: server.icon,
                splash: server.splash,
                discovery_splash: server.discovery_splash,
                banner: server.banner,
                approximate_presence_count: server.approximate_presence_count,
                approximate_member_count: server.approximate_member_count,
                premium_subscription_count: server.premium_subscription_count,
                preferred_locale: server.preferred_locale,
                vanity_url_code: server.vanity_url_code,
                keywords: server.keywords,
                features: server.features,
                partnered: server.features.includes('PARTNERED'),
                verified: server.features.includes('VERIFIED'),
                raw: server
            },
            null,
            4
        )
    )
    server.icon && fs.writeFile(nameIcon, Buffer.from((await icon?.arrayBuffer()) || 'null').toString('base64'), 'base64');
    server.banner && fs.writeFile(nameBanner, Buffer.from((await banner?.arrayBuffer()) || 'null').toString('base64'), 'base64');
    server.splash && fs.writeFile(nameSplash, Buffer.from((await splash?.arrayBuffer()) || 'null').toString('base64'), 'base64');
    fs.appendFile(`${path.resolve('..')}/guilds/README.md`, `* ${server.name} [${server.id}](./${server.id}/info.json)\n`);	
    console.log(`Guild ${server.name} (${server.id}) updated. 🚀`);
}

while(true) {
    const algoliaApiResponse = await fetch("https://nktzz4aizu-dsn.algolia.net/1/indexes/prod_discoverable_guilds/query", {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-GB",
          "content-type": "application/x-www-form-urlencoded",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-algolia-api-key": "aca0d7082e4e63af5ba5917d5e96bed0",
          "x-algolia-application-id": "NKTZZ4AIZU"
        },
        "referrer": "https://canary.discord.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `{"filters":"auto_removed:false AND approximate_presence_count> 0 AND approximate_member_count> 0","facets":["categories.id"],"hitsPerPage":1000,"page":${page}}`,
        "method": "POST",
        "mode": "cors"
    }).catch(() => {});

    const algolia = await algoliaApiResponse.json().catch(() => {});
    if (!algolia?.hits || algolia?.hits?.length === 0) break;

    for (const guild of algolia.hits) {
        await writeGuild(guild);
    }

    page++;
}

while(true) {
    const response = (await (await fetch(`https://discord.com/api/v10/discoverable-guilds?limit=48&offset=${offset}`, {
        headers: {
            'Authorization': discordToken
        }
    })).json()).guilds;

    if (!response || response.length === 0) {
        offset = 0;
        break;
    };

    for (const guild of response) {
        await writeGuild(guild);
    }

    offset += limit;
}

pushFiles(['guilds/.'], 'guilds');
