#include <stdint.h>

#define WIDTH  640
#define HEIGHT 480
#define CURSOR_SIZE 10

static uint32_t fb[WIDTH * HEIGHT];
static int mouse_x  = -1;
static int mouse_y  = -1;
static int color_toggle = 0;  // 0 = white, 1 = green

// Exports: data
uint32_t* get_fb() { return fb; }
int       get_w()  { return WIDTH; }
int       get_h()  { return HEIGHT; }

// Exports: input
void set_mouse(int x, int y) { mouse_x = x; mouse_y = y; }
void toggle_color()          { color_toggle = !color_toggle; }

// Packed RGBA (little-endian): bytes in memory = [R, G, B, A]
// 0xAABBGGRR -> R=RR, G=GG, B=BB, A=AA
#define BLACK 0xFF000000
#define WHITE 0xFFFFFFFF
#define GREEN 0xFF00FF00

void render_frame() {
    // Clear to black
    for (int i = 0; i < WIDTH * HEIGHT; i++)
        fb[i] = BLACK;

    if (mouse_x < 0 || mouse_y < 0) return;

    uint32_t color = color_toggle ? GREEN : WHITE;

    for (int dy = 0; dy < CURSOR_SIZE; dy++) {
        for (int dx = 0; dx < CURSOR_SIZE; dx++) {
            int px = mouse_x + dx;
            int py = mouse_y + dy;
            if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT)
                fb[py * WIDTH + px] = color;
        }
    }
}