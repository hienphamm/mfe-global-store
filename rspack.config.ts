import {defineConfig} from '@rspack/cli';
import {rspack} from '@rspack/core';
// @ts-ignore
import {ReactRefreshRspackPlugin} from '@rspack/plugin-react-refresh';
import {ModuleFederationPlugin} from '@module-federation/enhanced/rspack';
import {dirname} from 'path';
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ['last 2 versions', '> 0.2%', 'not dead', 'Firefox ESR'];

export default defineConfig({
    mode: isDev ? 'development' : 'production',
    resolve: {
        extensions: ['...', '.ts', '.tsx', '.jsx'],
    },
    output: {
        path: __dirname + '/dist',
        publicPath: 'auto',
        clean: true,
    },
    module: {},
    plugins: [
        isDev ? new ReactRefreshRspackPlugin() : null,
        new ModuleFederationPlugin({
            name: 'global_store',
            exposes: {
                './store': './src/index.ts',
            },
            shared: {
                rxjs: {
                    singleton: true
                }
            },
        }),
    ].filter(Boolean),
    optimization: {
        minimizer: [
            new rspack.SwcJsMinimizerRspackPlugin(),
            new rspack.LightningCssMinimizerRspackPlugin({
                minimizerOptions: {targets},
            }),
        ],
    },
    devServer: {
        port: 3000,
        hot: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        },
        static: {
            directory: __dirname + '/dist',
        },
    },
});