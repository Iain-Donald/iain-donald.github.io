## quickstart

### C program template

```c
#define FRAMEBUFFER_IMPL
#include "framebuffer.h"

WASM_EXPORT void render_frame() {
    fb_clear(FB_BLACK);
    // drawing code here
    fb_draw_cursor(10);
}
```

### Compile wasm

`zig cc ./wasm/yourprogram.c -I./wasm -target wasm32-freestanding -nostdlib "-Wl,--no-entry" "-Wl,--export-dynamic" -O2 -o ./wasm/yourprogram.wasm`

### Add entry to elementGenerator.json

```json
{
    "id": "yourprogram",
    "type": "main",
    "wasmPath": "./wasm/yourprogram.wasm",
    "jsLink": "/wasm/framebuffer.js",
    "state": "RUN"
}
```

- Set "state": "RUN" on the new entry, others to "LOAD" in programIndex.json.
- Reload.

### Development

Simply recompile the C module and reload with `ctrl+shift+r`. No need to restart the server.

### Further info

#### Testing server

- Python HTTP: `python3 -m http.server 8080`