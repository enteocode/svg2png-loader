import webpack from 'webpack';
import { getOptions, interpolateName } from 'loader-utils';
import { convert } from './toolkit';

import Loader, { LoaderOptions, ModuleExportSyntax } from '../index.d';

// Defaults

const TYPE_JS = 'js';
const TYPE_ES = 'es';
const TYPE_TS = 'typescript';

/**
 * @private
 */
const defaultOptions: LoaderOptions = {
    forceSuffix : false,
    name : '[name].[sha512:hash:base64:7][suffix].[ext]',
    type : TYPE_JS,
    ratios : [ 1.0 ],
    suffix : '@[ratio]x'
};

// Helpers

/**
 * @private
 */
const getInterpolatedFilename = (context: webpack.loader.LoaderContext, name: string, content: string | Buffer): string => {
    return interpolateName(context, name.replace('[ext]', 'png'), { content });
};

/**
 * @private
 */
const getEncoded = (value: any): string => {
    return JSON.stringify(value);
};

/**
 * @private
 */
const getJs = (defaultExport: any, exports: Object) => {
    return `module.exports = Object.defineProperty(${ getEncoded({ default : defaultExport, ... exports }) }, '__esModule', { value : true });`;
};

/**
 * @private
 */
const getEs = (defaultExport: any, exports: Object, types: boolean = false): string => {
    const list = Object.keys(exports).map((property) => `export const ${ property } = ${ getEncoded(exports[ property ]) };`);

    return list.concat([ 
        '',  
        `export default ${ getEncoded(defaultExport) };`
    ]).join('\n');
}

/**
 * @private
 */
const getTs = (defaultExport: any, exports: Object): string => {
    return 'declare module "." { export const scaled: string[]; export default string; }'.concat('\n\n', getEs(defaultExport, exports));
};

/**
 * @private
 */
const getExportDefinition = (defaultExport: any, exports: Object = {}, type: ModuleExportSyntax): string => {
    if (type === TYPE_ES) {
        return getEs(defaultExport, exports);
    }
    if (type === TYPE_TS) {
        return getTs(defaultExport, exports);
    }
    return getJs(defaultExport, exports);
}; 

/**
 * @public
 */
const loader: Loader = function (buffer: Buffer) {
    this.cacheable(true);

    const context = this;
    const { name, type, optimize, ratios, suffix, forceSuffix } = Object.assign({}, defaultOptions, getOptions(context));
    const callback = context.async();
    const variants = ratios.includes(1) ? ratios : [ 1 ].concat(ratios);

    // If optimization is not set directly, then guessing on
    // the environment

    const conversion = convert(
        buffer, 
        variants, 
        typeof optimize === 'boolean' ? optimize : context.mode === 'production'
    );

    conversion.then((converted) => {
        const base = getInterpolatedFilename(context, name, buffer);
        const scaled = [];

        let index = '';

        // Emitting rasterized assets

        converted.forEach((png, i) => {
            const ratio = variants[ i ];
            const token = ratio === 1 && ! forceSuffix ? '' : suffix.replace('[ratio]', String(ratio));
            const entry = base.replace('[suffix]', token);

            if (ratio === 1) {
                index = entry;
            }
            else {
                scaled.push(entry);
            }
            this.emitFile(entry, png, null);
        });

        // Providing a Module as output

        callback(null, getExportDefinition(index, { scaled }, type)
);
    }, 
        callback
    );

    conversion.catch(callback);
};

loader.raw = true;

export default loader;