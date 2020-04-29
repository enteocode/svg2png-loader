import { loader } from 'webpack';

/**
 * Transforms filename to its fnal
 */
export type FilenameTransformer = (file: string, content: string, pattern: string) => string;

/**
 * Module export format
 */
export type ModuleExportSyntax = "js" | "es" | "typescript";

/**
 * Options
 */
export interface LoaderOptions 
{
    /**
     * Should ratio 1.0 suffixed? (default: false)
     */
    forceSuffix?: boolean,

    /**
     * Name pattern (default: [name].[sha512:hash:base64:7][suffix].[ext])
     */
    name?: string,

    /**
     * Type of the module export (default: "js")
     */
    type?: ModuleExportSyntax,

    /**
     * Optimization if imagemin-optipng is installed as peer-dependency (default: true)
     */
    optimize?: boolean,

    /**
     * Suffix pattern (default: "@[ratio]x")
     */
    suffix?: string,

    /**
     * Pixel-ratios to scale (default: [ 1.0 ])
     */
    ratios?: number[]
}

/**
 * Definition of the exported Object
 */
export interface LoaderExport {
    default: string,
    scaled: string[]
}

/**
 * Loader
 */
export default interface Loader extends loader.Loader 
{
}

// Global

declare module "*.svg" {
    export default LoaderExport;
}

// Default

declare module "svg2png-loader" {
    export default Loader;
}