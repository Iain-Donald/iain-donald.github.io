#pragma once

#include <stdint.h>

#define EXPORT __attribute__((visibility("default")))
#define FB_MAX_PIXELS (4096 * 4096)

// Colors: 1 byte per channel, 4 bytes per pixel.
// 0xAABBGGRR

// state
static uint32_t fbPrev[FB_MAX_PIXELS]; // Stores previous frame to avoid full redraw. Pending complete implementation.
static uint32_t fb[FB_MAX_PIXELS];
static uint16_t fb_w = 640;
static uint16_t fb_h = 480;
static uint16_t mouse_x = -1;
static uint16_t mouse_y = -1;

// exports
EXPORT uint32_t* get_fb() { return fb; }
EXPORT uint16_t get_w() { return fb_w; }
EXPORT uint16_t get_h() { return fb_h; }
EXPORT void set_mouse(uint16_t x, uint16_t y) { mouse_x = x; mouse_y = y; }
EXPORT void set_size(uint16_t w, uint16_t h) {
    if (w * h > FB_MAX_PIXELS) return;
    fb_w = w; fb_h = h;
}

// drawPixel: unchecked. Clip upstream or use rect().
static inline void drawPixel(uint16_t x, uint16_t y, uint32_t color) {
    fb[y * fb_w + x] = color;
}

static void clear() {
    for (uint32_t i = 0; i < fb_w * fb_h; i++)
        *(fb + i) = 0x00000000;
}

static void rect(uint16_t x, uint16_t y, uint16_t w, uint16_t h, uint32_t color) {
    for (uint16_t py = y; py < y + h; py++) {
        uint32_t *dst = &fb[py * fb_w + x];
        for (uint16_t i = 0; i < w; i++)
            dst[i] = color;
    }
}

EXPORT void render_frame();
EXPORT void on_click();