import path from 'node:path';
import fs from 'node:fs/promises';
import fetch from 'node-fetch';
import { pushFiles } from '../utils/pushFiles.mjs';
import { existSync } from '../utils/existSync.mjs';

if (!(await existSync(`${path.resolve('..')}/guilds/`))) await fs.mkdir(`${path.resolve('..')}/guilds/`);

const files = [];

const length = 12;
let offset = 0;

while(true) {
    const algoliaApiResponse = await fetch("https://nktzz4aizu-dsn.algolia.net/1/indexes/prod_discoverable_guilds/query?x-algolia-agent=Algolia%20for%20JavaScript%20(4.1.0)%3B%20Browser", {
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
        "body": `{"filters":"auto_removed:false AND approximate_presence_count> 0 AND approximate_member_count> 0","facets":["categories.id"],"length":12,"offset":${offset}}`,
        "method": "POST",
        "mode": "cors"
      }).catch(() => {});

      console.log(algoliaApiResponse.status, algoliaApiResponse.statusText);
      const algolia = await algoliaApiResponse.json().catch(() => {});
      console.log(algolia);
      if (!algolia?.hits || algolia?.hits?.length === 0) break;

      for (const server of algolia.hits) {
        if (!(await existSync(`${path.resolve('..')}/guilds/${server.id}`))) fs.mkdir(`${path.resolve('..')}/guilds/${server.id}`);

        const icon = await fetch(`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.webp?size=1024`);
        const banner = await fetch(`https://cdn.discordapp.com/banners/${server.id}/${server.banner}.webp?size=1024`);
        const splash = await fetch(`https://cdn.discordapp.com/discovery-splashes/${server.id}/${server.splash}.webp?size=1024`);

        const nameIcon = `${path.resolve('..')}/guilds/${server.id}/icon.webp`;
        const nameBanner = `${path.resolve('..')}/guilds/${server.id}/banner.webp`;
        const nameSplash = `${path.resolve('..')}/guilds/${server.id}/splash.webp`;
        const nameInfo = `${path.resolve('..')}/guilds/${server.id}/info.json`;

        files.push(nameIcon, nameBanner, nameSplash, nameInfo);

        fs.writeFile(
            nameInfo,
            JSON.stringify(
                {
                    id: server.id,
                    name: server.name,
                    description: server.description,
                    icon: server.icon,
                    splash: server.splash,
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
                    raw: server,
                },
                null,
                4
            )
        )
        fs.writeFile(nameIcon, Buffer.from(await icon.arrayBuffer()).toString('base64'), 'base64');
        fs.writeFile(nameBanner, Buffer.from(await banner.arrayBuffer()).toString('base64'), 'base64');
        fs.writeFile(nameSplash, Buffer.from(await splash.arrayBuffer()).toString('base64'), 'base64');
        console.log(`Guild ${server.name} (${server.id}) updated. 🚀`);
      }

      offset += length;
}

pushFiles(files, 'guilds');
