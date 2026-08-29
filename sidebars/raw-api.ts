import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  rawApi: [
    {
      type: 'category',
      label: 'Manuals',
      collapsed: false,
      collapsible: false,
      items: [
        {
          type: 'category',
          label: 'Raw API',
          collapsed: false,
          collapsible: false,
          items: ['overview', 'the-heartbeat-loop', 'checklist'],
        },
      ],
    },
  ],
};

export default sidebars;
