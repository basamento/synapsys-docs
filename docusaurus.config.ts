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
 * Go and Python manuals are deliberately absent until those starters exist.
 * IA.md §5: nothing is documented that is not implemented.
 */

const GITHUB_ORG = 'JMarzoli';

const config: Config = {
  title: 'Synapsys',
  tagline: 'Bring every scattered script under one roof',
  favicon: 'img/favicon.svg',

  url: 'https://docs.synapsys.jmzworks.it',
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
        // Instance 1 of 6 — the default. Concepts and Get started.
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
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: 'Synapsys',
      logo: {
        alt: 'Synapsys',
        src: 'img/logo.svg',
      },
      items: [
        { to: '/docs/start', label: 'Docs', position: 'left' },
        { to: '/tutorials/hello-worker', label: 'Tutorials', position: 'left' },
        {
          type: 'dropdown',
          label: 'Manuals',
          position: 'left',
          items: [
            { to: '/manuals/core/install', label: 'Core' },
            { to: '/manuals/spring-boot/install', label: 'Spring Boot' },
            { to: '/manuals/raw-api/overview', label: 'Raw API' },
          ],
        },
        { to: '/reference/glossary', label: 'Reference', position: 'left' },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: `https://github.com/${GITHUB_ORG}/synapsys-core-go`,
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
            { label: 'Tutorials', to: '/tutorials/hello-worker' },
          ],
        },
        {
          title: 'Connect',
          items: [
            { label: 'Spring Boot', to: '/manuals/spring-boot/install' },
            { label: 'Raw API', to: '/manuals/raw-api/overview' },
          ],
        },
        {
          title: 'Project',
          items: [
            { label: 'Core', href: `https://github.com/${GITHUB_ORG}/synapsys-core-go` },
            { label: 'Spring Boot starter', href: `https://github.com/${GITHUB_ORG}/synapsys-springboot-starter` },
            { label: 'Blog', to: '/blog' },
          ],
        },
      ],
      copyright: `Synapsys — one nervous system for everything your company runs.`,
    },

    prism: {
      // Code blocks are dark in both themes (design system, tokens.css).
      theme: prismThemes.palenight,
      darkTheme: prismThemes.palenight,
      additionalLanguages: ['java', 'bash', 'json', 'yaml', 'python', 'go', 'properties'],
    },

    docs: {
      sidebar: { hideable: true, autoCollapseCategories: false },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
