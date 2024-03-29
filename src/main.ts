import moment from 'moment';
import { Script } from "@script_types/script/script";
import { ScriptConfig } from "../gen/spec_config";
import { ScriptCtxUI } from "@script_types/script/context_ui/context_ui";
import { getRadolanProjection } from "./projection";
import { SourceWeatherRadar } from "@script_types/sources/weather/source_weather_radar";
import { specification } from './spec';

export class Instance {
    private ctx: Script.Context;
    private config: ScriptConfig;
    
    constructor(ctx: Script.Context, config: ScriptConfig) {
        this.ctx = ctx;
        this.config = config;

        console.info("Ident:" + specification.id_ident);
        console.info("Config:", this.config);

        this.ctx.data.assets.init({
            expiry_ms: 60 * 60 * 1000, // Max 1 hour
            max_entry_count: 12
        })
    }

    public start = async () => {

        const handleSubscriptionResult = (result: { error: string | undefined }) => {
            if (result.error) console.error(result.error);
        }
        this.ctx.ui.subscribeDataRequests<"weather_radar">("weather_radar", this.dataRequestWeatherRadar).then(handleSubscriptionResult);

        console.log("Start done!");
    }

    public stop = async (_reason: Script.StopReason): Promise<void> => {
        console.info("Stopping all my stuff ...");
    }

    private dataRequestWeatherRadar: ScriptCtxUI.DataRequestCallback<"weather_radar">  = async (_req_params: object) => {
        const projection_name = 'PROJ:Radolan';
        const proj4_config = getRadolanProjection();

        // From RADOLAN Spec für Extended Germany Extend:
        // https://www.dwd.de/DE/leistungen/radolan/radolan_info/radolan_radvor_op_komposit_format_pdf.pdf
        const national_bl = { lat: 46.9526, lon: 3.5889 };
        const national_tr = { lat: 54.7208, lon: 15.7208 };
        const national_ext_bl = { lat: 46.1929, lon: 4.6759 };
        const national_ext_tr = { lat: 55.5342, lon: 17.1128 };
        const use_extended = false;
        var bottom_left = use_extended ? national_ext_bl : national_bl;   // old: { lat: 46.1929, lon: 4.6759 };
        var top_right   = use_extended ? national_ext_tr : national_tr;   // old: { lat: 55.5342, lon: 17.1128 }
        // TopLeft: 54.58770 / 2.07150 - BottomRight 47.07050 / 14.62090 => from the Radolan Decoder, but cannot 1:1 be translated in bottom/left and top/right => need to patch the library first!
        // Todo: get this data from the API! It's encoded in the radolan data, so it makes sense to get it from there, not hard code it here! But need to patch the lib first

        console.log("DataRequest ...")
        const layer_num = 10;
        let m = moment();
        m.startOf("minute");
        m.add(- m.minute() % 5, "minute");
        let entries: SourceWeatherRadar.OverlayEntry[] = [];
        for (let i = 0; i < layer_num; i ++){
            m.add(-5, "minute");
            const time_str = m.utc().format("YYMMDDHHmm");
            const url_png = `http://data.wunderview.de:4600/radar/v1/${time_str}_germany.png`;
            const asset_uid =  time_str + ".png";
            const t_ms = m.valueOf();
            const info = await this.ctx?.data.assets.getEntryInfo(asset_uid);
            if (!info) { 
                let resp_png = await this.ctx?.data.http.getRaw(url_png);
                if (resp_png && resp_png.body) {
                    // Todo: Make png black and white and transform to color only here! Allows to configure sensitivity!
                
                    this.ctx?.data.assets.insert({
                        base64: "data:image/png;base64," + resp_png.body.toString("base64"),
                        uid: asset_uid,
                        type: "png"
                    }, { id_num: t_ms });
                    entries.push({
                        time_ms: t_ms,
                        prognosis: false,
                        img_rain: {
                            asset_uid
                        }
                    })
                    console.log("DataRequest Add image:", m.toISOString())
                }  else {
                    console.error("ErrorAtRequest:" + resp_png?.error);
                }
            } else {
                entries.push({
                    time_ms: info.id_num ? info.id_num : 0,
                    prognosis: false,
                    img_rain: {
                        asset_uid
                    }
                })
            }
        }
        entries = entries.reverse();
        return {

            // Todo: insert the correct response type
            map_overlay: {
                entries,
                config_img_rain: {
                    img_bottom_left: bottom_left,
                    img_top_right: top_right,
                    projection_name: projection_name,
                    proj4_setup: proj4_config
                }
            }
        };
    }

}
