# D3 Developer Assessment
## Setup
1. Pull this repository.
2. Make sure an instance of MySQL is running (**Docker** or local) with a fresh new empty database. Take note of the username, password, and database name.
3. Duplicate `config.sample.js` and rename it `config.js`.
4. Fill in the relevant configuration information. Use `localhost` for host.
5. Run the following commands and proceed to test on `DB_PORT`.

```
npm i                   // install dependencies
node migration.js up    // create necessary tables
npm run start           // start the application
```

## Tests
[Jest](https://jestjs.io/en/) is used as the testing framework.
```
npm run test
```

## Design Choices
Available [here](docs/design.md).
