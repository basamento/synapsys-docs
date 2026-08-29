import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorials: [
    'index',
    {
      type: 'category',
      label: 'Fundamentals',
      collapsed: false,
      items: ['hello-worker', 'endless-process', 'progressive-process'],
    },
    {
      type: 'category',
      label: 'Application patterns',
      collapsed: false,
      items: [
        'adopt-a-spring-scheduled-job',
        'adopt-a-node-background-job',
        'diagnose-a-failed-execution',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      collapsed: false,
      items: ['deploy-core-on-linux', 'rotate-a-worker-token', 'backup-and-upgrade-core'],
    },
  ],
};

export default sidebars;
