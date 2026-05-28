/*#define FRAMEBUFFER_IMPL
#include "framebuffer.h"

WASM_EXPORT void render_frame() {
    fb_clear(FB_BLACK);
    fb_draw_cursor(10);
}*/

#include "framebuffer.h"

static int color_toggle = 0;

void on_click()      { color_toggle = !color_toggle; }

void render_frame() {
    clear(BLACK);
    if (mouse_x >= 0 && mouse_y >= 0)
        rect(mouse_x, mouse_y, 10, 10, color_toggle ? GREEN : WHITE);
}