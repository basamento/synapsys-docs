import type { ReactNode } from 'react';
import Layout from '@theme/Layout';

export default function Legal(): ReactNode {
  return (
    <Layout title="Legal and licensing" description="Ownership and licensing information for Synapsys.">
      <main className="container margin-vert--lg">
        <article className="theme-doc-markdown markdown">
          <h1>Legal and licensing</h1>

          <p>
            <strong>© 2026 Julian Marzoli (Basamento). All rights reserved.</strong>
          </p>

          <h2>Synapsys Core</h2>
          <p>
            Synapsys Core is proprietary software. Possession of its source code or a compiled
            distribution does not grant permission to copy, modify, redistribute, sublicense,
            or create derivative works except where written license terms expressly allow it.
          </p>

          <h2>Documentation</h2>
          <p>
            Original Synapsys documentation content is proprietary. You may read and reference
            it to use Synapsys, and you may adapt documentation code snippets when working with
            Synapsys or its openly licensed integrations. Republishing the documentation itself
            requires permission.
          </p>

          <h2>SDKs and starters</h2>
          <p>
            Official SDKs and starter libraries may be made available under an open-source
            license such as Apache License 2.0. The <code>LICENSE</code> file in each repository
            or distribution is authoritative and controls your rights to that component.
          </p>

          <p>
            A copyright notice records ownership; it does not replace the applicable license
            terms. If a component does not include an open-source license, no open-source rights
            should be assumed.
          </p>
        </article>
      </main>
    </Layout>
  );
}
