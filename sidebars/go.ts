import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  go: [
    {
      type: 'category',
      label: 'Go',
      collapsed: false,
      collapsible: false,
      items: ['install', 'configuration', 'processes-and-logs'],
    },
  ],
};

export default sidebars;
