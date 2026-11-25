import type { ReactNode } from 'react';
import Layout from '@theme/Layout';

export default function Legal(): ReactNode {
  return (
    <Layout title="Legal and licensing" description="Ownership and licensing information for Synapsys.">
      <main className="container margin-vert--lg">
        <article className="theme-doc-markdown markdown">
          <h1>Legal and licensing</h1>

          <p>
            <strong>© 2026 Julian Marzoli (Basamento).</strong>
          </p>

          <h2>Synapsys Core</h2>
          <p>
            Synapsys Core is source-available under the Elastic License 2.0. Its terms include
            restrictions on providing substantial functionality as a hosted or managed service.
            Contact the copyright holder about a separate license for uses outside those terms.
          </p>

          <h2>Documentation</h2>
          <p>
            Original Synapsys documentation content and website source are available under
            the Apache License 2.0. Third-party components retain their own licenses; see the
            {' '}<a href="/third-party-notices.txt">third-party notices</a> included in this site.
          </p>

          <h2>SDKs and starters</h2>
          <p>
            Official SDKs, starter libraries, and examples are
            available under the Apache License 2.0. Synapsys Core is licensed separately.
          </p>

          <p>
            The <code>LICENSE</code> file in each repository or distribution contains the
            applicable terms. Third-party components retain their own licenses.
          </p>
        </article>
      </main>
    </Layout>
  );
}
