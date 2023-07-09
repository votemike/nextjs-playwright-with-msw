// @ts-nocheck
import {test as base} from "@playwright/test";
import {createServer, Server} from "http";
import {rest} from "msw";
import type {SetupServerApi} from "msw/node";
import {AddressInfo} from "net";
import next from "next";
import path from "path";
import {parse} from "url";

const test = base.extend<{ port: string; requestInterceptor: SetupServerApi; rest: typeof rest; }>({
  port: [
    async ({}, use) => {
      const app = next({dev: false, dir: path.resolve(__dirname, "..")});
      await app.prepare();

      const handle = app.getRequestHandler();

      const server: Server = await new Promise(resolve => {
        const server = createServer((req, res) => {
          const parsedUrl = parse(req.url, true);
          handle(req, res, parsedUrl);
        });

        server.listen((error) => {
          if (error) throw error;
          resolve(server);
        });
      });
      const port = String((server.address() as AddressInfo).port);
      await use(port);
    },
    {
      scope: "worker",
      auto: true
    }
  ],
  requestInterceptor: [
    async({}, use) => {
      await use((() => {
        const {setupServer} = require("msw/node");
        const requestInterceptor = setupServer();

        requestInterceptor.listen({
          onUnhandledRequest: "bypass"
        });

        return requestInterceptor
      })());
    },
    {
      scope: "worker"
    }
  ],
  rest
});

export default test;
