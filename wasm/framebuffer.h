#ifndef FRAMEBUFFER_H
#define FRAMEBUFFER_H

#include <stdint.h>

#define WASM_EXPORT __attribute__((used, visibility("default")))

#define FB_WIDTH  640
#define FB_HEIGHT 480

#define FB_BLACK 0xFF000000
#define FB_WHITE 0xFFFFFFFF
#define FB_GREEN 0xFF00FF00
#define FB_RED   0xFF0000FF
#define FB_BLUE  0xFFFF0000

// --- Declarations (always visible to includers) ---
uint32_t* get_fb();
int       get_w();
int       get_h();
void      set_mouse(int x, int y);
void      toggle_color();
void      render_frame();

// --- Implementation (one .c file does: #define FRAMEBUFFER_IMPL before include) ---
#ifdef FRAMEBUFFER_IMPL

static uint32_t _fb[FB_WIDTH * FB_HEIGHT];
static int      _mouse_x      = -1;
static int      _mouse_y      = -1;
static int      _color_toggle =  0;

WASM_EXPORT uint32_t* get_fb() { return _fb; }
WASM_EXPORT int       get_w()  { return FB_WIDTH; }
WASM_EXPORT int       get_h()  { return FB_HEIGHT; }
WASM_EXPORT void set_mouse(int x, int y) { _mouse_x = x; _mouse_y = y; }
WASM_EXPORT void toggle_color()          { _color_toggle = !_color_toggle; }



static inline void fb_clear(uint32_t color) {
    for (int i = 0; i < FB_WIDTH * FB_HEIGHT; i++)
        _fb[i] = color;
}

static inline void fb_set_pixel(int x, int y, uint32_t color) {
    if (x >= 0 && x < FB_WIDTH && y >= 0 && y < FB_HEIGHT)
        _fb[y * FB_WIDTH + x] = color;
}

static inline void fb_fill_rect(int x, int y, int w, int h, uint32_t color) {
    for (int dy = 0; dy < h; dy++)
        for (int dx = 0; dx < w; dx++)
            fb_set_pixel(x + dx, y + dy, color);
}

static inline void fb_draw_cursor(int size) {
    if (_mouse_x < 0 || _mouse_y < 0) return;
    uint32_t color = _color_toggle ? FB_GREEN : FB_WHITE;
    fb_fill_rect(_mouse_x, _mouse_y, size, size, color);
}

#endif // FRAMEBUFFER_IMPL
#endif // FRAMEBUFFER_H