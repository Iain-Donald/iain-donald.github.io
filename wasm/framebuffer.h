#pragma once

#include <stdint.h>

#define EXPORT __attribute__((visibility("default")))
#define FB_MAX_PIXELS (4096 * 4096)

// Colors: 1 byte per channel, 4 bytes per pixel.
// 0xAABBGGRR
#define BLACK  0xFF000000
#define WHITE  0xFFFFFFFF
#define RED    0xFF0000FF
#define GREEN  0xFF00FF00
#define BLUE   0xFFFF0000

// state
static uint32_t fbPrev[FB_MAX_PIXELS]; // Stores previous frame to avoid full redraw. Pending complete implementation.
static uint32_t fb[FB_MAX_PIXELS];
static int fb_w    = 640;
static int fb_h    = 480;
static int mouse_x = -1;
static int mouse_y = -1;

// exports
EXPORT uint32_t* get_fb() { return fb; }
EXPORT int       get_w()  { return fb_w; }
EXPORT int       get_h()  { return fb_h; }

EXPORT void set_mouse(int x, int y) { mouse_x = x; mouse_y = y; }

EXPORT void set_size(int w, int h) {
    if (w * h > FB_MAX_PIXELS) return;
    fb_w = w; fb_h = h;
}

// drawPixel: unchecked. Clip upstream or use rect().
static inline void drawPixel(int x, int y, uint32_t color) {
    fb[y * fb_w + x] = color;
}

static void clear(uint32_t color) {
    for (int i = 0; i < fb_w * fb_h; i++)
        fb[i] = color;
}

static void rect(int x, int y, int w, int h, uint32_t color) {
    // clip to framebuffer bounds
    int x0 = x < 0      ? 0    : x;
    int y0 = y < 0      ? 0    : y;
    int x1 = x+w > fb_w ? fb_w : x+w;
    int y1 = y+h > fb_h ? fb_h : y+h;
    // draw
    for (int py = y0; py < y1; py++)
        for (int px = x0; px < x1; px++)
            drawPixel(px, py, color);
}

EXPORT void render_frame();
EXPORT void on_click();