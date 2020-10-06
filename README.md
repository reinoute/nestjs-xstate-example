# NestJS & XState example

Project to show some of the challenges and issues that I encountered when implementing XState in NestJS.

> Do _not_ use this as a starting point for your project ;-)

You can trigger state transitions using these end points:

- http://localhost:3000/order/create
- http://localhost:3000/order/approve
- http://localhost:3000/order/reject
- http://localhost:3000/order/cancel

## Installation

You need a local redis instance to run the project on `localhost:6379` (or change the details in `ConfigService`).

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```
