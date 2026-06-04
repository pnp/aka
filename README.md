# aka

A PnP version of aka.ms.

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

Before the first deployment, a repository admin must enable Pages for this repo and set the build source to GitHub Actions in Settings > Pages.

Run a local build with:

```shell
npm run build:local
```
