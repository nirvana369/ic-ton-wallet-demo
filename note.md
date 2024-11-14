npm install @ton/ton @ton/crypto @ton/core buffer
npm install vite-plugin-node-polyfills

@ton/ton need to use buffer so we need add plugins->nodePolyfills to vite.config.js

nodePolyfills({
    globals: {
    Buffer: true,
    global: true,
    process: true,
    },
})

dfx generate
dfx deploy
npm start