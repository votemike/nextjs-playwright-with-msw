import {expect} from "@playwright/test";
import test from "./fixture";

test("Bulbasaur", async ({page, port, rest, requestInterceptor}) => {
  requestInterceptor.use(
    rest.get('https://pokeapi.co/api/v2/pokemon/bulbasaur', (req, res, ctx) =>
      res(
        ctx.json({name: 'squirtle'})
      )
    )
  );
  await page.goto(`http://localhost:${port}/`);
  const name = await page.innerText('h1');
  expect(name).toBe('squirtle');
});
