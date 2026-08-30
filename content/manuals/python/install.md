---
title: Install and adopt
description: Install the framework-neutral Synapsys Python SDK and connect ordinary functions without changing their business logic.
---

# Install and adopt

The Python SDK registers synchronous or asynchronous functions as Synapsys
processes. It is framework-neutral, opens no inbound port, and has no runtime
dependencies.

| | |
| --- | --- |
| Python | 3.9 or later; tested through 3.13 |
| PyPI distribution | `basamento-synapsys` `0.2.0` |
| Import package | `basamento_synapsys` |
| Core framework identifier | `python` |

```bash
python -m pip install basamento-synapsys==0.2.0
```

```python
from basamento_synapsys import StopSignal, Synapsys

worker = Synapsys(worker_name="operations-worker")
```

Set the deployment secrets before starting:

```bash
SYNAPSYS_CORE_URL=https://core.example.com
SYNAPSYS_CORE_TOKEN=syn_replace_with_a_worker_token
```

Register all processes, then call `worker.start()` once. Plain Python has no
universal application lifecycle, so startup and shutdown remain explicit. The SDK
is not a scheduler: Core chooses when each registered function is invoked.

## Distribution and source

Version `0.2.0` is available on [PyPI](https://pypi.org/project/basamento-synapsys/)
and is classified Alpha even though its version has no prerelease suffix. See the
[SDK source](https://github.com/basamento/synapsys-python-sdk), the
[consumer example](https://github.com/basamento/synapsys-python-sdk-example), and the
[ecosystem release matrix](/reference/client-libraries).

Next: [configure lifecycle, logging, and shutdown](./configuration).
