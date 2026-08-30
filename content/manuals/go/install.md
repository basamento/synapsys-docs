---
title: Install and adopt
description: Install the framework-neutral Synapsys Go SDK and explicitly register existing functions and methods.
---

# Install and adopt

The Go SDK is a framework-neutral module for explicit process registration. It uses
only the standard library, opens no inbound port, and requires Go 1.22 or later.

```bash
go get github.com/basamento/synapsys-go-sdk@v0.1.0
```

```go
import "github.com/basamento/synapsys-go-sdk"

worker, err := synapsys.New(
    synapsys.WithWorkerName("operations-worker"),
)
if err != nil {
    return err
}
```

`Worker.Register` accepts declarations created by `Endless`, `EndlessContext`,
`Progressive`, and `ProgressiveContext`. Register everything before `Start()`.
Core—not a timer in the SDK—decides when each declaration runs.

```bash
SYNAPSYS_CORE_URL=https://core.example.com
SYNAPSYS_CORE_TOKEN=syn_replace_with_a_worker_token
```

Version `v0.1.0` is available through the [Go module
proxy](https://proxy.golang.org/github.com/basamento/synapsys-go-sdk/@v/list) and
[pkg.go.dev](https://pkg.go.dev/github.com/basamento/synapsys-go-sdk). See the
[source](https://github.com/basamento/synapsys-go-sdk), the
[consumer example](https://github.com/basamento/synapsys-go-sdk-example), and the
[release matrix](/reference/client-libraries).

Next: [configure startup, logging, and shutdown](./configuration).
