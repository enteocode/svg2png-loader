'use strict';

const path = require('path');

/**
 * @private
 */
const resolve = (file) => {
    return path.resolve(__dirname, file);
};

/**
 * @public
 */
module.exports = {
    mode : 'production',
    target : 'web',
    entry : '../test/webpack.logo.svg',
    output : {
        filename : 'index.js',
        path : __dirname
    },
    context : __dirname,
    optimization : {
        minimize : false
    },
    module : {
        rules : [ 
            { 
                test : /\.svg$/, 
                loader : resolve('../index.js'),
                options : { ratios : [ 1, 1.5 ], optimize : false }
            } 
        ]
    }
};

