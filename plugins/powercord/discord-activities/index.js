const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { get } = require('powercord/http');

class VoiceActivities extends Plugin {
    async startPlugin() {
        const activities = JSON.parse((await get('https://raw.githubusercontent.com/xHyroM/discord-activities/master/activities.json')).body.toString());

        const prop = await getModule(['getEnabledAppIds']);
        const appIds = activities.map(activity => activity.id);

        Object.defineProperty(prop, 'getEnabledAppIds', {
            value: () => appIds,
            writable: true
        })
    }

    async pluginWillUnload() {
        const prop = await getModule(['getEnabledAppIds']);

        Object.defineProperty(prop, 'getEnabledAppIds', {
            value: () => [],
            writable: true
        })
    }
}

module.exports = VoiceActivities;