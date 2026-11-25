import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';

/**
 * Content lives under content/, one directory per docs instance.
 * The instance boundaries are the versioning boundaries — see IA.md §1.
 * Everything launches unversioned (the system is v1 until first public
 * release); the instances exist separately from day one so that turning
 * versioning on later never has to move a URL.
 *
 * Complete connection methods receive manuals. An implemented but unpublished
 * package must state that status prominently. IA.md records the product map and
 * versioning boundaries.
 */

const GITHUB_ORG = 'basamento';

const config: Config = {
  title: 'Synapsys',
  tagline: 'Bring every scattered script under one roof',
  favicon: 'img/favicon.svg',

  url: 'https://docs.synapsys.basamento.org',
  baseUrl: '/',
  organizationName: GITHUB_ORG,
  projectName: 'synapsys-docs',
  trailingSlash: false,

  // A broken internal link is a build failure, not a warning. This is the
  // single most valuable guardrail on a docs site that will grow to hundreds
  // of cross-references.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',

  future: {
    // Rspack + SWC. Requires the v4 flags, which we want anyway — this site has
    // no legacy behaviour to preserve, so opting in now avoids a migration.
    v4: true,
    faster: true,
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        // Default instance. Concepts and Get started.
        docs: {
          id: 'concepts',
          path: 'content/concepts',
          routeBasePath: 'docs',
          sidebarPath: './sidebars/concepts.ts',
          editUrl: `https://github.com/${GITHUB_ORG}/synapsys-docs/tree/main/`,
          showLastUpdateTime: true,
        },
        blog: {
          path: 'blog',
          routeBasePath: 'blog',
          showReadingTime: true,
          blogTitle: 'Releases and design notes',
          blogDescription: 'What changed in Synapsys, and why.',
          feedOptions: { type: 'all' },
          editUrl: `https://github.com/${GITHUB_ORG}/synapsys-docs/tree/main/`,
          onInlineTags: 'throw',
          onInlineAuthors: 'throw',
          onUntruncatedBlogPosts: 'throw',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    require('./scripts/third-party-notices.cjs'),
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'tutorials',
        path: 'content/tutorials',
        routeBasePath: 'tutorials',
        sidebarPath: './sidebars/tutorials.ts',
        editUrl: `https://github.com/${GITHUB_ORG}/synapsys-docs/tree/main/`,
        showLastUpdateTime: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'core',
        path: 'content/manuals/core',
        routeBasePath: 'manuals/core',
        sidebarPath: './sidebars/core.ts',
        editUrl: `https://github.com/${GITHUB_ORG}/synapsys-docs/tree/main/`,
        showLastUpdateTime: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'spring-boot',
        path: 'content/manuals/spring-boot',
        routeBasePath: 'manuals/spring-boot',
        sidebarPath: './sidebars/spring-boot.ts',
        editUrl: `https://github.com/${GITHUB_ORG}/synapsys-docs/tree/main/`,
        showLastUpdateTime: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'nodejs',
        path: 'content/manuals/nodejs',
        routeBasePath: 'manuals/nodejs',
        sidebarPath: './sidebars/nodejs.ts',
        editUrl: `https://github.com/${GITHUB_ORG}/synapsys-docs/tree/main/`,
        showLastUpdateTime: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'python',
        path: 'content/manuals/python',
        routeBasePath: 'manuals/python',
        sidebarPath: './sidebars/python.ts',
        editUrl: `https://github.com/${GITHUB_ORG}/synapsys-docs/tree/main/`,
        showLastUpdateTime: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'go',
        path: 'content/manuals/go',
        routeBasePath: 'manuals/go',
        sidebarPath: './sidebars/go.ts',
        editUrl: `https://github.com/${GITHUB_ORG}/synapsys-docs/tree/main/`,
        showLastUpdateTime: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'dotnet',
        path: 'content/manuals/dotnet',
        routeBasePath: 'manuals/dotnet',
        sidebarPath: './sidebars/dotnet.ts',
        editUrl: `https://github.com/${GITHUB_ORG}/synapsys-docs/tree/main/`,
        showLastUpdateTime: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'raw-api',
        path: 'content/manuals/raw-api',
        routeBasePath: 'manuals/raw-api',
        sidebarPath: './sidebars/raw-api.ts',
        editUrl: `https://github.com/${GITHUB_ORG}/synapsys-docs/tree/main/`,
        showLastUpdateTime: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reference',
        path: 'content/reference',
        routeBasePath: 'reference',
        sidebarPath: './sidebars/reference.ts',
        editUrl: `https://github.com/${GITHUB_ORG}/synapsys-docs/tree/main/`,
        showLastUpdateTime: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/logo.svg',

    colorMode: {
      defaultMode: 'light',
      // Keep the control a predictable light/dark toggle. A third "system"
      // state made clicks appear to do nothing whenever the OS was dark.
      respectPrefersColorScheme: false,
    },

    navbar: {
      title: 'Synapsys',
      logo: {
        alt: 'Synapsys',
        src: 'img/logo.svg',
      },
      items: [
        { to: '/docs/start', label: 'Docs', position: 'left' },
        { to: '/tutorials/', label: 'Tutorials', position: 'left' },
        {
          type: 'dropdown',
          label: 'Manuals',
          position: 'left',
          items: [
            { to: '/manuals/core/install', label: 'Core' },
            { to: '/manuals/spring-boot/install', label: 'Spring Boot' },
            { to: '/manuals/nodejs/install', label: 'Node.js' },
            { to: '/manuals/python/install', label: 'Python' },
            { to: '/manuals/go/install', label: 'Go' },
            { to: '/manuals/dotnet/install', label: '.NET' },
            { to: '/manuals/raw-api/overview', label: 'Raw API' },
          ],
        },
        { to: '/reference/glossary', label: 'Reference', position: 'left' },
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/docs/start/sandbox', label: 'Try it', position: 'right' },
        {
          href: `https://github.com/${GITHUB_ORG}/synapsys-core`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    footer: {
      style: 'light',
      logo: {
        alt: 'Synapsys',
        src: 'img/logo.svg',
        width: 22,
        height: 22,
      },
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Get started', to: '/docs/start' },
            { label: 'Concepts', to: '/docs/concepts/architecture' },
            { label: 'Tutorials', to: '/tutorials/' },
          ],
        },
        {
          title: 'Connect',
          items: [
            { label: 'Spring Boot', to: '/manuals/spring-boot/install' },
            { label: 'Node.js', to: '/manuals/nodejs/install' },
            { label: 'Python', to: '/manuals/python/install' },
            { label: 'Go', to: '/manuals/go/install' },
            { label: '.NET', to: '/manuals/dotnet/install' },
            { label: 'Raw API', to: '/manuals/raw-api/overview' },
          ],
        },
        {
          title: 'Project',
          items: [
            { label: 'Core', href: `https://github.com/${GITHUB_ORG}/synapsys-core` },
            { label: 'Spring Boot starter', href: `https://github.com/${GITHUB_ORG}/synapsys-spring-boot-starter` },
            { label: 'Node.js SDK', href: `https://github.com/${GITHUB_ORG}/synapsys-node-sdk` },
            { label: 'Python SDK', href: `https://github.com/${GITHUB_ORG}/synapsys-python-sdk` },
            { label: 'Go SDK', href: `https://github.com/${GITHUB_ORG}/synapsys-go-sdk` },
            { label: '.NET SDK', href: `https://github.com/${GITHUB_ORG}/synapsys-dotnet-sdk` },
            { label: 'Blog', to: '/blog' },
          ],
        },
      ],
      copyright: `Synapsys — one nervous system for everything your company runs.<br />© 2026 Julian Marzoli (Basamento). <a href="/legal">Legal and licensing</a>.`,
    },

    prism: {
      // Code blocks are dark in both themes (design system, tokens.css).
      theme: prismThemes.palenight,
      darkTheme: prismThemes.palenight,
      additionalLanguages: ['java', 'bash', 'json', 'yaml', 'javascript', 'typescript', 'properties', 'python', 'go', 'csharp'],
    },

    docs: {
      sidebar: { hideable: true, autoCollapseCategories: false },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
