#include "framebuffer.h"

static int color_toggle = 0;

void on_click()      { color_toggle = !color_toggle; }

void render_frame() {
    clear();
    if (mouse_x >= 0 && mouse_y >= 0)
        rect(mouse_x, mouse_y, 10, 10, color_toggle ? GREEN : WHITE);
}

void render_blocks() {
    // for drawing, calculate difference between changed pixels before and after. 
    // Pixel p, frame n. pn-2, pn-1, and pn. 
    // Draw pixel:  
}