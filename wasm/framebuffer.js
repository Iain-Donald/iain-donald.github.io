export async function init(containerSelector, wasmPath) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const { instance } = await WebAssembly.instantiateStreaming(fetch(wasmPath));
    const exp = instance.exports;

    const canvas = document.createElement('canvas');
    canvas.width  = exp.get_w();
    canvas.height = exp.get_h();
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

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
    canvas.addEventListener('click',      () => exp.toggle_color());

    function loop() {
        exp.render_frame();
        const ptr = exp.get_fb();
        const raw = new Uint8ClampedArray(exp.memory.buffer, ptr, canvas.width * canvas.height * 4);
        ctx.putImageData(new ImageData(raw, canvas.width, canvas.height), 0, 0);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}