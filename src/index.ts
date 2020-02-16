import serverutil from './serverutil';
import { onUserConnect } from './userserver';
import { onServerConnect } from './gameserver';

export default (serverPort: number, clientPort: number) => {
  try {
    const userServer = serverutil(onUserConnect).on('error', err => {
      console.error(err);
    });

    const gameServer = serverutil(onServerConnect).on('error', err => {
      console.error(err);
    });
    userServer.listen({ port: clientPort }, () => {
      console.log(
        `User server is running!`,
      );
    });
    gameServer.listen({ port: serverPort }, () => {
      console.log(
        `Game server is running!`,
      );
    });
  } catch (err) {
    console.error(err);
  }
};
