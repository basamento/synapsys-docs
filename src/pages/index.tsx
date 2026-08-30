import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

/**
 * Landing page — built from the "Product" boards in the design canvas.
 *
 * Deliberately plain CSS modules over the token layer rather than Tailwind +
 * shadcn: this page turned out to be static layout with no interactive
 * components, so the preflight/prefix workarounds Tailwind needs alongside
 * Infima would buy friction and nothing else. Revisit if a genuinely
 * interactive surface appears.
 */

type WorkerRow = {
  name: string;
  runtime: string;
  state: 'running' | 'stopping' | 'idle' | 'failed';
};

// Illustrative, not real telemetry. The failed row is deliberate: showing a
// failure in the shop window is honest, and it exercises the red token.
const WORKERS: WorkerRow[] = [
  { name: 'billing-jobs', runtime: 'spring boot · 3 processes', state: 'running' },
  { name: 'etl-runner', runtime: 'node.js · 1 process', state: 'stopping' },
  { name: 'report-worker', runtime: 'python · 2 processes', state: 'idle' },
  { name: 'inventory-sync', runtime: 'go · 2 processes', state: 'failed' },
];

const PILL: Record<WorkerRow['state'], string> = {
  running: styles.pillRunning,
  stopping: styles.pillStopping,
  idle: styles.pillIdle,
  failed: styles.pillFailed,
};

const SAMPLE = `@SynapsysProcess(name = "nightly-sync")
public class NightlySync extends AbstractEndlessProcess {

    @Override
    protected void runForever(StopSignal stop) throws Exception {
        while (!stop.isStopRequested()) {
            reconcileInvoices();
            Thread.sleep(5_000);
        }
    }
}`;

function Hero() {
  return (
    <div className={styles.band}>
      <div className={styles.bandInner}>
        <div className={styles.heroCopy}>
          <span className={styles.badge}>
            <span className={styles.dot} />
            Five official language integrations
          </span>
          <h1 className={styles.heroTitle}>Bring every scattered script under one roof.</h1>
          <p className={styles.heroLead}>
            See, start, stop and troubleshoot background work across applications and machines
            from one protected console. Workers connect out; they never need an inbound port.
          </p>
          <div className={styles.ctaRow}>
            <Link className={styles.btnPrimary} to="/docs/start">
              Start in 5 minutes
            </Link>
            <Link className={styles.btnSecondary} to="/docs/start/sandbox">
              Try the live sandbox
            </Link>
            <Link className={styles.btnSecondary} to="/docs/concepts/heartbeat-protocol">
              Read the protocol
            </Link>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span>WORKERS</span>
            <span className={styles.panelMeta}>synced 2s ago</span>
          </div>
          {WORKERS.map((w) => (
            <div className={styles.row} key={w.name}>
              <span className={styles.rowName}>
                <strong>{w.name}</strong>
                <span>{w.runtime}</span>
              </span>
              <span className={`${styles.pill} ${PILL[w.state]}`}>{w.state}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Starters() {
  return (
    <div className={styles.strip}>
      <div className={styles.stripInner}>
        <span className={styles.stripLabel}>CONNECT WITH</span>
        <div className={styles.chips}>
          <Link className={styles.chip} to="/manuals/spring-boot/install">
            <span className={styles.chipDot} />
            Spring Boot
          </Link>
          <Link className={styles.chip} to="/manuals/nodejs/install">
            <span className={styles.chipDot} />
            Node.js
          </Link>
          <Link className={styles.chip} to="/manuals/python/install">
            <span className={styles.chipDot} />
            Python
          </Link>
          <Link className={styles.chip} to="/manuals/go/install">
            <span className={styles.chipDot} />
            Go
          </Link>
          <Link className={styles.chip} to="/manuals/dotnet/install">
            <span className={styles.chipDot} />
            .NET
          </Link>
          <Link className={styles.chip} to="/manuals/raw-api/overview">
            <span className={styles.chipDot} />
            Raw API
          </Link>
        </div>
      </div>
    </div>
  );
}

function Problem() {
  return (
    <>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Nobody knows what is running where.</h2>
        <p className={styles.sectionLead}>
          A poller inside a service. A Node.js import script. A maintenance task only one
          engineer knows how to run. Synapsys leaves that work where it belongs and gives
          teams one consistent place to operate it.
        </p>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="var(--syn-link)" strokeWidth="1.7">
            <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <h3 className={styles.cardTitle}>Outbound by design</h3>
          <p className={styles.cardBody}>
            Workers use one authenticated heartbeat. Core never calls them, so applications
            need no new listener, ingress route or inbound firewall rule.
          </p>
        </div>
        <div className={styles.card}>
          <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="var(--syn-success)" strokeWidth="1.7">
            <path d="m8 5-6 7 6 7M16 5l6 7-6 7" />
          </svg>
          <h3 className={styles.cardTitle}>Logs with every run</h3>
          <p className={styles.cardBody}>
            Follow a process from start to finish and inspect its captured output in context,
            instead of searching across hosts after something fails.
          </p>
        </div>
        <div className={styles.card}>
          <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="var(--syn-link)" strokeWidth="1.7">
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <path d="M3 9h18" />
          </svg>
          <h3 className={styles.cardTitle}>Operate from any screen</h3>
          <p className={styles.cardBody}>
            The authenticated console adapts to desktop, tablet and mobile layouts, with
            touch-friendly navigation and entity views.
          </p>
        </div>
      </div>
    </>
  );
}

function Sample() {
  return (
    <div className={styles.sampleBand}>
      <div className={styles.sampleInner}>
        <div className={styles.sampleCopy}>
          <span className={styles.eyebrow}>ADOPT, DON'T REWRITE</span>
          <h2 className={styles.sampleTitle}>Wrap the work you already trust.</h2>
          <p className={styles.sampleLead}>
            Your existing job keeps its own code. Extend the base class, declare whether it
            runs forever or runs once, and cooperate with the stop signal. The starter handles
            authentication, heartbeats, command tokens, lifecycle and execution output.
          </p>
          <Link className={styles.inlineLink} to="/tutorials/hello-worker">
            Follow the tutorial →
          </Link>
        </div>
        <div className={styles.sampleCode}>
          <CodeBlock language="java" title="NightlySync.java">
            {SAMPLE}
          </CodeBlock>
        </div>
      </div>
    </div>
  );
}

function Cta() {
  return (
    <div className={styles.ctaWrap}>
      <div className={styles.cta}>
        <div>
          <h2 className={styles.ctaTitle}>Point your first worker at a Core in five minutes.</h2>
          <p className={styles.ctaLead}>
            Run the Core container, create a worker token, and add one published dependency.
            Spring Boot, Node.js, Python, Go, .NET, and direct HTTP integrations share
            one lifecycle contract. Check each manual for current package availability.
          </p>
        </div>
        <div className={styles.ctaButtons}>
          <Link className={styles.btnPrimary} to="/docs/start">
            Get started
          </Link>
          <Link className={styles.btnSecondary} to="/tutorials/hello-worker">
            Follow the tutorial
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Bring every scattered script under one roof"
      description="Synapsys gives companies one self-hosted console to see, start, stop and troubleshoot background work through authenticated outbound heartbeats."
    >
      <Hero />
      <Starters />
      <Problem />
      <Sample />
      <Cta />
    </Layout>
  );
}
