import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'

export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'cjs',
        exports: 'named',
        preserveModules: true,
        minifyInternalExports: false,
    },
    plugins: [
        typescript(),
        terser({
            mangle: false,
            compress: {
                global_defs: {
                    BUILD: true,
                },
            },
            output: {
                beautify: true,
            },
        }),
    ]
};