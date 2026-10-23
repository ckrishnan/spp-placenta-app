import type {NextConfig} from 'next';

// GitHub Pages only serves static files, so the app is exported as a static
// site. `NEXT_PUBLIC_BASE_PATH` is set by .github/workflows/deploy.yml from the
// Pages `base_path` output:
//   - "" when a custom domain is configured (site served from the domain root)
//   - "/<repo-name>" for the default https://<user>.github.io/<repo>/ URL
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  trailingSlash: true,
  images: {
    // The Next.js image optimizer requires a server; static hosting has none.
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
