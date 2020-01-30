import serverutil from './serverutil';
import { onUserConnect } from './userserver';
import { onServerConnect } from './gameserver';

try {
  const userServer = serverutil(onUserConnect).on('error', err => {
    console.error(err);
  });

  const gameServer = serverutil(onServerConnect).on('error', err => {
    console.error(err);
  });
  userServer.listen({ port: 8080 }, () => {
    console.log(
      `User server is listenning on the address ${userServer.address()} !`,
    );
  });
  gameServer.listen({ port: 8081 }, () => {
    console.log(
      `Game server is listenning on the address ${gameServer.address()}`,
    );
  });
} catch (err) {
  console.error(err);
}
