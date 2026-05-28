import { StateBranch } from "./utils.js";

// Start exception logger
const stateLog = new StateBranch("Create StateBranch", "INFO");

class Element {
    constructor(data) {
        this.data = new Map(Object.entries(data));
    }

    getProperty(property) {
        if (this.data.has(property)) return this.data.get(property);
        stateLog.commitStatus({ level: "WARN", message: "Element.getProperty: Property not found." });
        return null;
    }
}

async function loadElements() {
    try {
        const [{ elements }, { programs }] = await Promise.all([
            fetch('./components/elementGenerator.json').then(r => {
                if (!r.ok) throw new Error(`elementGenerator.json fetch failed. Status: ${r.status}`);
                return r.json();
            }),
            fetch('./components/programIndex.json').then(r => {
                if (!r.ok) throw new Error(`programIndex.json fetch failed. Status: ${r.status}`);
                return r.json();
            })
        ]);
        return { elements, programs };
    } catch (error) {
        stateLog.commitStatus({ level: "ERROR", message: `loadElements: ${error.message}` });
        return null;
    }
}

function displayElements(targetSelector, data) {
    if (!data) {
        stateLog.commitStatus({ level: "WARN", message: "displayElements: no data provided." });
        return;
    }

    const { elements, programs } = data;
    const col = document.querySelector(targetSelector);
    if (!col) {
        stateLog.commitStatus({ level: "WARN", message: `displayElements: selector '${targetSelector}' not found.` });
        return;
    }

    for (const item of elements) {
        const el = new Element(item);
        const programID = el.getProperty('mainProgramID') ?? el.getProperty('programID') ?? null;
        const prog = programs.find(p => p.id === programID);

        if (prog?.status === 'run') {
            // WebAssembly.instantiateStreaming(fetch(prog.wasmPath), ...)
        }

        const node = document.createElement('div');
        node.className = 'element';
        if (programID) node.dataset.programId = programID;
        node.innerHTML = `
            <p class="element__title">${el.getProperty('title')}</p>
            <p class="element__lang">${el.getProperty('lang')}</p>
            <p class="element__subtitle">${el.getProperty('subTitle')}</p>
            <p class="element__desc">${el.getProperty('description')}</p>
            <div class="element__wasm" id="wasm_${programID}"></div>
        `;
        col.appendChild(node);

        if (prog) initProgram(prog, programID);
    }
}

// elementState — uppercase values
const elementState = {
    current: null,

    setRun(id) {
        this.current = id;
    },

    getStatus(id) {
        return this.current === id ? 'RUN' : 'LOAD';
    }
};

// initProgram — match uppercase and jsLink
async function initProgram(prog, programID) {
    const status = elementState.getStatus(programID);

    if (status === 'RUN') {
        const { init } = await import(new URL(prog.jsLink, window.location.origin).href);
        await init(`#wasm_${programID}`, prog.wasmPath);
        stateLog.commitStatus({ level: "INFO", message: `initProgram: running ${programID}` })
    } else if (status === 'LOAD') {
        // const module = await WebAssembly.compileStreaming(fetch(prog.wasmPath));
        // moduleCache.set(programID, module);
        stateLog.commitStatus({ level: "INFO", message: `initProgram: preloaded ${programID}` });
    }
}

// Seed elementState.current from JSON on load
const data = await loadElements();

const initialRun = data?.programs.find(p => p.state === 'RUN');
if (initialRun) elementState.setRun(initialRun.id);

displayElements('.elementColumn', data);