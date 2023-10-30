const path = require('path');
// const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/server.js', // Entry point for your server code
    target: 'node-webkit', // node, commonjs// Specifies that the bundle should be targeted for Node.js
    // externalsPresets: { node: true },
    output: {
        filename: 'server.bundle.js', // Output file name
        path: path.resolve(__dirname, 'dist'), // Output directory
        libraryTarget: 'commonjs',
    },
    optimization: {
        minimize: false, // Prevents minification of the output
    },
    mode: 'production', // Set the mode to 'production' to optimize the bundle
    // externals: [nodeExternals({
    //     // importType: 'commonjs', // commonjs, amd
    //     // modulesFromFile: true,
    //     // allowlist: ['ws', '@cocreate/organizations'],
    //     allowlist: [
    //         "@cocreate/authenticate",
    //         "@cocreate/authorize",
    //         "@cocreate/config",
    //         "@cocreate/crud-server",
    //         "@cocreate/file-server",
    //         "@cocreate/industry",
    //         "@cocreate/metrics-server",
    //         "@cocreate/mongodb",
    //         // "@cocreate/notification",
    //         // "@cocreate/organizations",
    //         "@cocreate/server-side-render",
    //         "@cocreate/socket-server",
    //         // "@cocreate/unique",
    //         // "@cocreate/users",
    //         // "@cocreate/uuid",
    //         // "fs",
    //         // "http",
    //         // "path",
    //         // "events",
    //         'ws'
    //     ],

    // })]

    // externals: [nodeExternals({
    //     importType: 'commonjs',
    //     modulesFromFile: true, // Use modules from package.json
    //     modulesDir: 'node_modules', // Set the node_modules directory
    //     modulesFromFile: {
    //         fileName: path.resolve(__dirname, 'package.json'),
    //         includeInBundle: ['dependencies'], // Include dependencies and peerDependencies
    //     },
    //     allowlist: [],
    // })]
};
