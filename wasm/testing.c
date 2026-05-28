#define FRAMEBUFFER_IMPL
#include "framebuffer.h"

WASM_EXPORT void render_frame() {
    fb_clear(FB_BLACK);
    fb_draw_cursor(10);
}