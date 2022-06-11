/**
 * @name VoiceActivities
 * @author xHyroM
 * @authorId 525316393768452098
 * @version 0.1.0
 * @description Allows you to start activiity in voice channel
 * @invite AjKJSBbGm2
 * @website https://hyro.pages.dev
 * @donate https://ko-fi.com/garlicteam
 * @source https://github.com/xHyroM/discord-activities/blob/master/plugins/betterdiscord
 * @updateUrl https://raw.githubusercontent.com/xHyroM/discord-activities/master/plugins/betterdiscord/discord-activities.plugin.js
 */

 class VoiceActivities {
    constructor() {
        const config = {
            info: {
                name: 'Voice Activities',
                authors: [
                    {
                        name: 'xHyroM',
                        github_username: 'xHyroM'
                    }
                ],
                version: '0.1.0',
                description: 'Allows you to start activity in voice channel',
            }
        };

        this._config = config;
        this.prop = BdApi.findModuleByProps(['getEnabledAppIds']);
    }

    getName() {
        return this._config.info.name;
    }

    getAuthor() {
        return this._config.info.authors.map(author => author.name).join(', ');
    }

    getDescription() {
        return this._config.info.description;
    }

    getVersion() {
        return this._config.info.version;
    }

    async start() {
        const activities = await (await fetch('https://raw.githubusercontent.com/xHyroM/discord-activities/master/activities.json')).json();
        const appIds = activities.map(activity => activity.id);

        Object.defineProperty(this.prop, 'getEnabledAppIds', {
            value: () => appIds,
            writable: true
        })
    }

    stop() {
        Object.defineProperty(this.prop, 'getEnabledAppIds', {
            value: () => [],
            writable: true
        })
    }
}
