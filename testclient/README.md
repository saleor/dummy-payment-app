<div align="center">
  <h1>Saleor Next.js Stripe Example</h1>
</div>

<div align="center">
  <p>A minimalistic example of using <a href="https://github.com/saleor/saleor">Saleor</a> with <a href="https://stripe.com">Stripe</a>.</p>
</div>

<div align="center">
  <a href="https://saleor.io/">🏠 Website</a>
  <span> • </span>
  <a href="https://docs.saleor.io/docs/3.x/">📚 Docs</a>
  <span> • </span>
  <a href="https://saleor.io/blog/">📰 Blog</a>
  <span> • </span>
  <a href="https://twitter.com/getsaleor">🐦 Twitter</a>
  <span> • </span>
  <a href="https://discord.gg/H52JTZAtSH">💬 Discord</a>
</div>

<br>

https://github.com/saleor/example-nextjs-stripe/assets/1338731/2c387a4e-5271-4c32-866e-241c593116a2

## Quickstart

1. Clone this repository
2. Create `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Replace the `SALEOR_API_URL` environment variable with the address of your Saleor GraphQL endpoint.

4. Make sure your Saleor instance has the [Saleor Stripe App](https://stripe.saleor.app/) installed and configured.

5. Install the dependencies:

```bash
pnpm i
```

6. Generate the types based on GraphQL schema:

```bash
pnpm generate
```

7. Start the development server:

```bash
pnpm dev
```
