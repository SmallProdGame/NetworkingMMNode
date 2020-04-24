# SmallProdGame Networking Matchmaking

## Presentation

This NodeJS application has been made to work with the Unity3D package SmallProdGame Networking
which is a networking solution that you can use with DOTS.
You can find this package here https://github.com/SmallProdGame/UnityNetworking .


## How to use it?

This project is a npm package, just create a new NodeJS project and had it like this:

```bash
npm install @smallprod/game-networking-mm
```

or if you are using yarn:

```bash
yarn add @smallprod/game-networking-mm
```

Now that you have the package, you can create a file to be your entrypoint (ie. **index.js**, **index.ts**, **server.js**, **server.ts** or whatever you want).
In this file just had something like this:

```ts
import MatchMaking from '@smallprod/game-networking-mm';

MatchMaking.startServers(8081, 8080);
```

This is **Typescript** but you can adapt it to **Javascript** easily.

This is the simplest thing you can do, it will create two TCP servers, one for your players listenning on the port 8080 and one for your game servers listenning on the port 8081.

If you want to customize this server, it's totally possible, you can override a lot's of things to make it work as you want!

For more information just look at the [wiki](https://github.com/SmallProdGame/NetworkingMMNode/wiki)
