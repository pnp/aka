# aka

A PnP version of aka.ms.

Yes, we know there are other URL shortener services. We want to have our own for the following reasons:

- We want to have a single, consistent domain for all our short links.
- We want to have control over the short link creation process, including the ability to add custom metadata and telemetry.
- We want to have a simple, open-source solution that we can easily maintain and extend as needed.
- We have no control over the short link creation process on aka.ms, and we want to be able to create short links for our content without having to go through a third-party service.

The published short-link domain is `https://pnp.ms/`.

## Add a redirect

Create a Markdown file in `content` named after the short link slug. Add the destination URL in the `url` front matter field.

For example, `content/matrix.md` creates `https://pnp.ms/matrix/`:

```markdown
---
url: "https://learn.microsoft.com/sharepoint/dev/spfx/compatibility"
---
```

Nested files create nested short paths. For example, `content/t/hugo.md` creates `https://pnp.ms/t/hugo/`.

You can also create a short path and nested short paths with the same prefix. For example, use `content/pnpcore.md` for `https://pnp.ms/pnpcore/` and `content/pnpcore/log.md` for `https://pnp.ms/pnpcore/log/`.

If the URL does not include a scheme, the site redirects to `https://`.

Query parameters on the short link are appended to the destination. For example, `https://pnp.ms/webparts/?q=hugo` redirects to `https://pnp.github.io/sp-dev-fx-webparts/?q=hugo`.

The `url` field is intentionally used only as the redirect destination. A prebuild script converts files from `content` into Hugo-safe generated pages so Hugo does not treat `url` as the page permalink.

Every redirect page automatically renders this telemetry image before redirecting:

```html
<img src="https://pnptelemetry.azurewebsites.net/pnp.github.io/aka/[slug]" alt="">
```

## Deployment

GitHub Actions builds pull requests for validation. Pushes to `main`, including merged pull requests, build and deploy the Hugo site to GitHub Pages for `https://pnp.ms/`.

Run a local build with:

```shell
npm run build:local
```

## Why this approach?

We didn't want to worry about paying for databases, permissions, etc.

If you have admin access to this repo, you can approve the PRs and the links will be published.

If you have contributor access to this repo, you can submit a PR. As long as your link relates to PnP content or initiatives, we'll most likely approve it.

Please, for the love of all that is holy, keep your URLs short.

## So... do I use an AKA.ms or a PNP.ms link?

Well, we're not the link police... but what we suggest:

- If it is a Microsoft initiative, use aka.ms
- If it is a PnP initiative, use pnp.ms
- If it is a community initiative, supported by PnP, use pnp.ms


## What, no home page?

Nope. `https://pnp.ms/` redirects to `https://pnp.github.io/` which is our main documentation hub. We don't want to create confusion about the purpose of this site by having a home page with content. The only content on this site should be the redirects.
