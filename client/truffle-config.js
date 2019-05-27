module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // for more about customizing your Truffle configuration!
    contracts_directory: "./src/contracts/src",
    contracts_build_directory: "./src/contracts/build",
    migrations_directory: "./src/contracts/migrate",
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*" // Match any network id
        }
    }
};
