
export function getRadolanProjection(): string {

    // proj   - stere == Stereographic => https://proj.org/operations/projections/stere.html
    // lat_0  - Latitude of projection center
    // lon_0  - Longitude of projecton center
    // lat_ts - Defines the latitude where scale is not distorted.
    // k_0    - Scale factor. Determines scale factor used in the projection. Defaults to 1.0
    // ellps  - ellipsoid: Defaults to GRS80
    // +R     - Radius of the sphere in meters, if used with +ellps, +r wins
    // +x_0   - False Eastening, Defaults to 0.0
    // +y_0   - False northing, Defaults to 0.0

    // +datum - Declare the datum used with the coordinates

    /*
        RADOLAN Projection Parameters from : 
        https://www.dwd.de/DE/leistungen/radolan/radolan_info/radolan_radvor_op_komposit_format_pdf.pdf?__blob=publicationFile&v=15

        - PROJECTION[“Stereographic_North_Pole”]
        - PARAMETER[“central_meridian_1”, 10.0]
        - PARAMETER[“standard_parallel_1”, 60.0]
        - PARAMETER[“latitude_of_origin”, 90.0]
        - PARAMETER[“scale_factor”, 1.0]
        - PARAMETER[“false_easting”, 0.0]
        - PARAMETER[“false_northing”, 0.0]
        */

    let central_meridian_1 = 10.0;
    let standard_parallel_1 = 60.0;
    let latitude_of_origin = 90.0;
    let scale_factor = 1.0;
    let false_easting = 0.0;
    let false_northing = 0.0;
    let earth_radius_m = 6370.04 * 1000;

    const proj4_config =
        `+proj=stere +lat_0=${latitude_of_origin} +lon_0=${central_meridian_1} +lat_ts=${standard_parallel_1} +k=${scale_factor} `
        + `+x_0=${false_easting} +y_0=${false_northing} `
        + `+units=m +no_defs +R=${earth_radius_m}`;

    return proj4_config;
}