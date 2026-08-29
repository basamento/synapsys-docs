import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  springBoot: [
    {
      type: 'category',
      label: 'Manuals',
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: 'category',
          label: 'Spring Boot',
          collapsed: false,
          collapsible: false,
          items: ['install', 'configuration', 'processes-and-logs'],
        },
      ],
    },
  ],
};

export default sidebars;
