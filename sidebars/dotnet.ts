import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  dotnet: [
    {
      type: 'category',
      label: '.NET',
      collapsed: false,
      collapsible: false,
      items: ['install', 'configuration', 'processes-and-logs'],
    },
  ],
};

export default sidebars;
