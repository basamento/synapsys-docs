import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  concepts: [
    {
      type: 'category',
      label: 'Get started',
      collapsed: false,
      collapsible: false,
      link: { type: 'doc', id: 'start/index' },
      items: [
        'start/run-the-core',
        'start/first-worker',
        'start/start-and-stop',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      collapsible: false,
      items: [
        'concepts/architecture',
        'concepts/heartbeat-protocol',
        'concepts/execution-states',
      ],
    },
  ],
};

export default sidebars;
