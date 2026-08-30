import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  python: [
    {
      type: 'category',
      label: 'Python',
      collapsed: false,
      collapsible: false,
      items: ['install', 'configuration', 'processes-and-logs'],
    },
  ],
};

export default sidebars;
