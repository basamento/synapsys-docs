import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  core: [
    {
      type: 'category',
      label: 'Manuals',
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: 'category',
          label: 'Core',
          collapsed: false,
          collapsible: false,
          items: ['install', 'authentication', 'configuration', 'console-and-logs'],
        },
      ],
    },
  ],
};

export default sidebars;
