## Quickstart

### C program template

```c
#define FRAMEBUFFER_IMPL
#include "framebuffer.h"

WASM_EXPORT void render_frame() {
    fb_clear(FB_BLACK);
    // fun area
    fb_draw_cursor(10);
}
```

### Compile wasm

`zig cc ./wasm/program.c -I./wasm -target wasm32-freestanding -nostdlib "-Wl,--no-entry" "-Wl,--export-dynamic" -O2 -o ./wasm/program.wasm`

### Add entry to elementGenerator.json

```json
{
    "id": "program",
    "type": "main",
    "wasmPath": "./wasm/program.wasm",
    "jsLink": "/wasm/framebuffer.js",
    "state": "RUN"
}
```

- Set "state": "RUN" on the new entry, others to "LOAD" in programIndex.json.
- Reload.

### Development

Recompile the C module and reload with `ctrl+shift+r`. No need to restart the server.

### Further info

#### Testing server

- Python HTTP: `python3 -m http.server 8080`