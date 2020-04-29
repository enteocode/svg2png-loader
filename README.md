svg2png-loader ![Build Status][A]
==============

> Webpack Loader to convert SVG to multiple PNG images for different 
> pixel-ratios using PhantomJS

## Goals

- No platform dependencies (Inkscape, Imagick, etc...)
- Fallback (IE)
- Image src-set (Browser)
- SVG import for `NativeImage` (Electron, supporting `ratios` for retina)

## Highlights

- Type-strict as possible (TypeScript)
- ES7
- Pixel-ratio support

## Install

```bash
$ npm i -D svg2png-loader
```

## Usage

Basic usage with multiple pixel-ratios:

```javascript
module.exports = {
    module : {
        rules : [ 
            { 
                test : /\.svg$/, 
                loader : 'svg2png-loader',
                options : { 
                    ratios : [ 1, 2, 3 ]
                }
            } 
        ]
    }
};
```

## Options

### ratios

Type: `number[]`  
Default: `[ 1 ]`

Pixel-ratios to render during the load.

### name

Type: `string`  
Default: `"[name].[hash:7][suffix].[ext]"`

The name pattern of exported asset, according to Webpack standards.
The `[suffix]` must be on the end with its default value to work with Electron
properly.

### type

Type: `string`  
Accepted values: `"js"`, `"es"`, `"typescript"`  
Default: `"js"`

You can specify the export syntax if want to chain together with another 
loader, like `babel-loader` or `ts-loader`. The TypeScript version
includes module level type-definitions if the globals wouldn't work in
your IDE context.

### optimize

Type: `boolean`  

If enabled and `imagemin-optipng` is installed as a peer-dependency, then 
the compiled assets will be optimized after the rendering process is done. If not set, then it will try to apply on `production`, but not in other environments.

### suffix

Type: `string`  
Default: `"@[ratio]x"`

Pattern of the suffix.

### forceSuffix

Type: `boolean`  
Default: `false`

If disabled, then the default exported size (1x) won't be suffixed.

## License

MIT © 2020, Székely Ádám


[A]: https://api.travis-ci.com/enteocode/svg2png-loader.svg?branch=master