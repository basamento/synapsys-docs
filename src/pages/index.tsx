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
  { name: 'etl-runner', runtime: 'python · 1 process', state: 'stopping' },
  { name: 'scrape-fleet', runtime: 'go · 8 processes', state: 'idle' },
  { name: 'report-gen', runtime: 'raw api · 2 processes', state: 'failed' },
];

const PILL: Record<WorkerRow['state'], string> = {
  running: styles.pillRunning,
  stopping: styles.pillStopping,
  idle: styles.pillIdle,
  failed: styles.pillFailed,
};

const SAMPLE = `@SynapsysProcess(name = "nightly-sync", type = ENDLESS)
public class NightlySync extends AbstractSynapsysProcess {

    @Override
    public void run(StopSignal stop) {
        while (!stop.requested()) {
            reconcileInvoices();
            stop.sleep(Duration.ofMinutes(5));
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
            Spring Boot starter is live
          </span>
          <h1 className={styles.heroTitle}>Bring every scattered script under one roof.</h1>
          <p className={styles.heroLead}>
            Register, start, stop and track every program your company runs — across machines,
            across languages — from one console. Workers connect out. You open nothing.
          </p>
          <div className={styles.ctaRow}>
            <Link className={styles.btnPrimary} to="/docs/start">
              Start in 5 minutes
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
          <Link className={styles.chip} to="/manuals/raw-api/overview">
            <span className={styles.chipDot} />
            Raw API
          </Link>
          <span className={styles.chipMuted}>
            <span className={styles.chipDotMuted} />
            Go — planned
          </span>
          <span className={styles.chipMuted}>
            <span className={styles.chipDotMuted} />
            Python — planned
          </span>
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
          A cron job on a server someone left. A Python script on a laptop. A Spring service
          nobody restarts because they are not sure what depends on it. Synapsys does not
          replace any of them — it gives them one place to be seen and controlled from.
        </p>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="var(--syn-link)" strokeWidth="1.7">
            <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <h3 className={styles.cardTitle}>One endpoint</h3>
          <p className={styles.cardBody}>
            The entire contract is a single outbound POST every few seconds. Nothing to route,
            nothing to firewall, no agent to keep alive.
          </p>
        </div>
        <div className={styles.card}>
          <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="var(--syn-success)" strokeWidth="1.7">
            <path d="m8 5-6 7 6 7M16 5l6 7-6 7" />
          </svg>
          <h3 className={styles.cardTitle}>Any language</h3>
          <p className={styles.cardBody}>
            Plain HTTP and JSON. Spring Boot ships today; speaking the protocol directly is a
            supported path, not a fallback.
          </p>
        </div>
        <div className={styles.card}>
          <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="var(--syn-link)" strokeWidth="1.7">
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <path d="M3 9h18" />
          </svg>
          <h3 className={styles.cardTitle}>One binary</h3>
          <p className={styles.cardBody}>
            The Core ships as a single Go binary with its console compiled in. Run it, point
            workers at it, and they appear.
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
          <span className={styles.eyebrow}>STEP ONE OF THREE</span>
          <h2 className={styles.sampleTitle}>Annotate what you already wrote.</h2>
          <p className={styles.sampleLead}>
            Your existing job keeps its own code. Extend the base class, declare whether it
            runs forever or runs once, and cooperate with the stop signal. The starter handles
            registration, the heartbeat and the command tokens.
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
            One Docker command for the Core, one dependency in your build file. No account, no
            agent, nothing to open.
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
      description="Synapsys centralises registration, control and execution tracking for every program your company runs — across machines and languages, through a single outbound heartbeat."
    >
      <Hero />
      <Starters />
      <Problem />
      <Sample />
      <Cta />
    </Layout>
  );
}
