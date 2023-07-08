import { DataSource } from '../../toolchain/types/spec/spec_source';

export const specification: DataSource.Specification = {
    category:  "weather",
    id_ident:  "radar_germany",
    id_author: "thmang82",
    // ---
    provides: [ "weather_radar" ],
    // ---
    version:   "0.8.1",
    // ---
    translations: {
        'en': { 
            name: "Rain Radar Germany", 
            description: "Based on raw data from DWD."
        }
    },
    // ---
    parameters: [
       // No parameters yet
    ],
    notifications: [],
    data_fetch: {
        // Note: setting data_fetch to undefined will disable automatic fetching! You have to take care for yourself then, e.g. by subscribing to visiblity changes via ctx.script.visSubscribe
        interval_active_sec: 5 * 60, // Fetch data every  5 minutes in case at least one screen showing data from this source is in state 'active'
        interval_idle_sec: 15 * 60   // Fetch data every 15 minutes in case at least one screen showing data from this source is in state '(active) idle'
    },
    geo_relevance: {
        countries: [ 'DE' ],
        cities: [],
        everywhere: false
    }
}