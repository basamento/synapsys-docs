import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  nodejs: [
    {
      type: 'category',
      label: 'Manuals',
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: 'category',
          label: 'Node.js',
          collapsed: false,
          collapsible: false,
          items: ['install', 'configuration', 'processes-and-logs'],
        },
      ],
    },
  ],
};

export default sidebars;
