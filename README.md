# aka

A PnP version of aka.ms.

Yes, we know there are other URL shortener services. We want to have our own for the following reasons:

- We want to have a single, consistent domain for all our short links.
- We want to have control over the short link creation process, including the ability to add custom metadata and telemetry.
- We want to have a simple, open-source solution that we can easily maintain and extend as needed.
- We have no control over the short link creation process on aka.ms, and we want to be able to create short links for our content without having to go through a third-party service.

Yes, we know that our current URL is *not* short enough. We are working on a custom short domain for this site, but in the meantime, we wanted to get something up and running quickly.

## Add a redirect

Create a Markdown file in `content` named after the short link slug. Add the destination URL in the `url` front matter field.

For example, `content/matrix.md` creates `https://pnp.github.io/aka/matrix/`:

```markdown
---
url: "https://learn.microsoft.com/sharepoint/dev/spfx/compatibility"
---
```

If the URL does not include a scheme, the site redirects to `https://`.

The `url` field is intentionally used only as the redirect destination. A prebuild script converts files from `content` into Hugo-safe generated pages so Hugo does not treat `url` as the page permalink.

Every redirect page automatically renders this telemetry image before redirecting:

```html
<img src="https://pnptelemetry.azurewebsites.net/pnp.github.io/aka/[slug]" alt="">
```

## Deployment

GitHub Actions builds pull requests for validation. Pushes to `main`, including merged pull requests, build and deploy the Hugo site to GitHub Pages at `https://pnp.github.io/aka/`.

Run a local build with:

```shell
npm run build:local
```
