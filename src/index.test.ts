import { LoaderOptions, LoaderExport } from '../index.d';

import webpack from 'webpack';
import fs from 'fs';
import vm from 'vm';
import path from 'path';

import VirtualModules from 'webpack-virtual-modules';
import VirtualFilesystem from 'memory-fs';

// Definitions

type ObjectLiteral<T = any> = {
    [ property: string ]: T
};

type CompilationResult = {
    data: LoaderExport,
    disk: ObjectLiteral<number>
};

type Sanitizer<T> = (value: string | Buffer) => T;

// Shared resources

const image = fs.readFileSync(path.resolve(__dirname, '../test/webpack.logo.svg'));

// Helpers

/**
 * @private
 */
const getSanitizedDepth = <T>(source: Object, property: string, sanitizer: Sanitizer<T>): ObjectLiteral<T> => {
    if (! source) {
        return null;
    }
    return Object.keys(source).reduce((data, key) => ({ ... data, [ key ] : sanitizer(source[ key ][ property ]) }), {});
};

/**
 * @private
 */
const runScript = (code: string, variables: Object = null): any => {
    return vm.runInContext(code, vm.createContext(variables));
};

/**
 * @private
 */
const getCompilationResult = ({ modules }: webpack.compilation.Compilation, entry: string = 'index.js'): CompilationResult => {
    const target = modules.find((module) => entry === module.resource);

    if (! target) {
        return null;
    }
    // Running generated module in a sandboxed environment to get its result as valid 
    // Javascript object and collecting emitted file sizes

    const data = runScript(target._source._value, { module : {} });
    const disk = getSanitizedDepth<number>(target.buildInfo.assets, '_value', (value) => value.length);

    return {
        data,
        disk
    };
};

/**
 * @private
 */
const getWebpackBailout = (entry: string, image: Buffer, options: LoaderOptions = void 0): Promise<CompilationResult> => {
    return new Promise((resolve, reject) => {
        const loader = path.resolve(__dirname, '../index.js');
        const compiler = Object.assign(webpack({
            mode : 'production',
            target : 'web',
            entry,
            plugins : [
                // We need Buffer, but Virtual Modules annotation suggest string
                // @ts-ignore

                new VirtualModules({ [ entry ] : image })
            ],
            module : {
                rules : [ { test : /\.svg$/, loader, options } ]
            }
        }), {
            outputFileSystem : new VirtualFilesystem()
        });
        
        compiler.run((error, stats) => {
            error ? reject(error) : resolve(getCompilationResult(stats.compilation, entry));
        });
    })
};

// Tests

describe('svg2png-loader', () => {
    it('should configuration change behavior', async () => {
        const { data } = await getWebpackBailout('/image.svg', image, { 
            forceSuffix : true,
            name : '[name][suffix].[ext]', 
            optimize : false,
            suffix : '.[ratio]'
        });

        expect(data).toMatchObject({ default : 'image.1.png' });
    });

    it('should integrate', async () => {
        const { data, disk } = await getWebpackBailout('/image.svg', image, { 
            name : '[name][suffix].[ext]', 
            optimize : true,
            ratios : [ 1, 1.5 ] 
        });
        const raster = 'image.png';
        const scaled = 'image@1.5x.png';

        // Checking presence on module export

        expect(data).toMatchObject({ default : raster, scaled : [ scaled ] });

        // Checking emitted assets

        expect(disk).toHaveProperty([ scaled ]);

        // Checking file sizes (on local helper return)

        expect(disk[ scaled ]).toBeGreaterThan(disk[ raster ]);
    });
});