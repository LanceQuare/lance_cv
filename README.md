# Lance CV

Static React CV site for Lance Zheng. The site is built with Vite, React, and TypeScript, serves both CV variants from typed content data, and is packaged for Docker and k3s deployment.

## Features

- Single-page resume site with Version A and Version B profile switching via `?version=a|b`
- Clean corporate visual system with responsive layout and dark mode toggle
- Download links for the existing PDF resumes from `public/cv/`
- Optional analytics script injection driven by Vite environment variables
- NGINX-based Docker runtime with SPA-safe routing and a `/__health` endpoint
- Plain Kubernetes manifests for k3s with Traefik ingress

## Local Development

```bash
npm install
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Preview the built site locally:

```bash
npm run preview
```

## Optional Analytics

Copy `.env.example` to `.env.local` and fill only the keys you need.

Supported build-time variables:

- `VITE_ANALYTICS_SCRIPT_URL`
- `VITE_ANALYTICS_DATA_DOMAIN`
- `VITE_ANALYTICS_WEBSITE_ID`
- `VITE_ANALYTICS_HOST_URL`

If `VITE_ANALYTICS_SCRIPT_URL` is empty, no analytics script is injected.

## Docker

Build the production image:

```bash
npm run docker:build
```

Run the container locally on port `8080`:

```bash
npm run docker:run
```

Health check:

```bash
curl http://localhost:8080/__health
```

The NGINX config serves hashed assets with long cache headers, keeps `index.html` uncached, and rewrites SPA routes back to the entry document.

## Docker Hub Push

Replace `your-dockerhub-user` and the version tag as needed.

```bash
docker build -t your-dockerhub-user/lance-cv:0.1.0 .
docker push your-dockerhub-user/lance-cv:0.1.0
```

## k3s Deployment

The manifests live in `k8s/`:

- `namespace.yaml`
- `deployment.yaml`
- `service.yaml`
- `ingress.yaml`

Before applying them, update these placeholders:

- Docker image in `k8s/deployment.yaml`
- Public hostname in `k8s/ingress.yaml`
- TLS secret name in `k8s/ingress.yaml`

Apply the manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

Check rollout status:

```bash
kubectl -n lance-cv rollout status deployment/lance-cv
```

## Content Maintenance

The markdown files in `cv/` remain the source reference for the written resume content. The live site reads from typed objects in `src/data/cv.ts` so the UI is explicit and easy to tune.

When updating the site:

1. Edit the source markdown in `cv/`.
2. Mirror the relevant wording changes in `src/data/cv.ts`.
3. Rebuild with `npm run build`.
4. Rebuild and push the Docker image.
5. Update the image tag in `k8s/deployment.yaml` and roll out the deployment.
