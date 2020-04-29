'use strict';

/*
 * Webpack configuration
 *
 * This is the main configuration file for Webpack 4.
 *
 * To keep this file in the root with the exact same name can be essential
 * for different parallel processes like JEST, which can support ES6+ if this
 * file is present.
 *
 * @private
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

// Definitions

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * @type {Object}
 */
module.exports = {
    devtool : isDevelopment ? 'inline-source-map' : void 0,
    target : 'node',
    mode : 'production',
    stats : {
        children : false
    },
    entry : {
        index : [ './src/index.ts' ]
    },
    output : {
        libraryTarget : 'commonjs2',
        filename : '[name].js',
        path : path.resolve(__dirname)
    },
    optimization : {
        minimizer : [
            new TerserPlugin({
                parallel : true,
                cache : true,
                terserOptions : {
                    parse : {
                        ecma : 5
                    },
                    compress : {
                        drop_console : true,
                        passes : 3,
                        warnings : false
                    },
                    mangle : {
                        safari10 : true
                    },
                    output : {
                        ascii_only : false,
                        ecma : 5,
                        comments : false
                    }
                },
            })
        ]
    },
    resolve : {
        extensions : [
            '.js',
            '.ts'
        ]
    },
    externals : [
        'loader-utils',
        'svg2png',
        'imagemin-optipng'
    ],
    module : {
        strictExportPresence : true,
        rules : [
            {
                test : /\.ts$/,
                exclude : /node_modules/,
                use : [
                    {
                        loader : 'ts-loader'
                    },
                    {
                        loader : 'eslint-loader',
                        options : {
                            failOnWarning : isDevelopment,
                            cache : true
                        }
                    }
                ]
            }
        ]
    }
};
