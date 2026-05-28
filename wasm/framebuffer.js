export async function init(containerSelector, wasmPath) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const { instance } = await WebAssembly.instantiateStreaming(fetch(wasmPath));
    const exp = instance.exports;

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function syncSize() {
        canvas.width  = exp.get_w();
        canvas.height = exp.get_h();
    }
    syncSize();

    canvas.addEventListener('mousemove', e => {
        const rect   = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        exp.set_mouse(
            Math.floor((e.clientX - rect.left) * scaleX),
            Math.floor((e.clientY - rect.top)  * scaleY)
        );
    });

    canvas.addEventListener('mouseleave', () => exp.set_mouse(-1, -1));
    canvas.addEventListener('click',      () => exp.on_click?.());

    let running = true; // Ability to stop looping if not active in DOM.
    function loop() {
        if (!running) return;
        syncSize();  // no-op if unchanged, catches set_size() calls from C
        exp.render_frame();
        const raw = new Uint8ClampedArray(exp.memory.buffer, exp.get_fb(), canvas.width * canvas.height * 4);
        ctx.putImageData(new ImageData(raw, canvas.width, canvas.height), 0, 0);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    return () => { running = false; };
}