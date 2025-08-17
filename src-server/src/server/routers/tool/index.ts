import {Elysia} from "elysia";
import chatRouters from './chat';
import manageRouters from './manage';

export default new Elysia({prefix: '/tool'})
  .use(chatRouters)
  .use(manageRouters)