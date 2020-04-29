import svg2png from 'svg2png';

// Definitions

export type AttributeEncoder = (input: any) => any;

export type Size = {
    width: number,
    height: number
};

// Errors

export const ERROR_INVALID_DIMENSIONS = 'No size found in vector source';
export const ERROR_INVALID_RATIO = 'Ratios must be greater than 0';

// Helpers

let optimizer = void 0;

/**
 * @private
 */
const getOptimizer = () => {
    if (optimizer === void 0) {
        try {
            optimizer = require('imagemin-optipng')();
        }
        catch (e) {
            optimizer = null;
        }
    }
    return optimizer;
};


/**
 * @private
 */
const getAttributeValue = (input: string, attribute: string, encoder: AttributeEncoder = parseFloat) => {
    const match = input.match(RegExp(`${ attribute }="([^"]+)"`, 'i'));

    if (! match) {
        return void 0;
    }
    if (encoder) {
        return encoder(match[ 1 ]);
    }
    return match[ 1 ];
};

/**
 * @private
 */
const getSize = (width: number, height: number): Size => {
    return width && height ? { width, height } : null;
};

/**
 * @private
 */
const getView = (view: string): number[] => {
    return view.trim().split(/\s+/).map((dimension) => parseFloat(dimension));
};

/**
 * @private
 */
const getImageDimensions = (buffer: string): Size => {
    const content = String(buffer);
    const w = getAttributeValue(content, 'width');
    const h = getAttributeValue(content, 'height');

    if (w && h) {
        return getSize(w, h);
    }
    const view = getAttributeValue(content, 'viewBox', getView);

    if (view) {
        return getSize(
            view[ 2 ] - view[ 0 ],
            view[ 3 ] - view[ 1 ]
        );
    }
    return null;
};

/**
 * @private
 */
const getScaled = ({ width, height }: Size, scale = 1): Size => {
    return { width : width * scale, height : height * scale };
}

/**
 * @public
 */
export const convert = async (buffer: Buffer, ratios: number[], isOptimizationEnabled: boolean): Promise<Buffer[]> => {
    const content = String(buffer);
    const size = getImageDimensions(content);

    if (! size) {
        return Promise.reject(ERROR_INVALID_DIMENSIONS);
    }
    if (ratios.find((ratio) => ratio <= 0)) {
        return Promise.reject(ERROR_INVALID_RATIO);
    }

    return Promise.all(ratios.map((ratio) => {
        const conversion = svg2png(buffer, getScaled(size, ratio));

        // Trying to optimize produced PNGs with lossless compressor
        // OptiPNG
        // Takes long seconds to be done, so enabled only in PRODUCTION at higher level

        if (isOptimizationEnabled) {
            const optimizer = getOptimizer();

            optimizer && conversion.then(async (buffer) => {
                try {
                    return await optimizer(buffer);
                }
                catch(e) {
                    return buffer;
                }
            });
        }
        return conversion;
    }));
};