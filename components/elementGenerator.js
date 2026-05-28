import { StateBranch } from "./utils.js";

// Start exception logger
const stateLog = new StateBranch("Create StateBranch", "INFO");

const cancelFunctions = new Map();

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

    // build elements column and create click listener.
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

        node.classList.add(elementState.getStatus(programID) === 'RUN' ? 'elementExpanded' : 'elementCollapsed');

        node.addEventListener('click', () => {
            if (node.classList.contains('elementCollapsed'))
                transitionRun(programID, data);
        });

        if (prog) initProgram(prog, programID);
    }
}

// elementState
const elementState = {
    current: null,

    setRun(id) {
        this.current = id;
    },

    getStatus(id) {
        return this.current === id ? 'RUN' : 'LOAD';
    }
};

// Handle starting and stopping element WASM programs.
function transitionRun(newID, data) {
    const prevID = elementState.current;
    elementState.setRun(newID);

    document.querySelectorAll('.element').forEach(el => {
        const isActive = el.dataset.programId === newID;
        el.classList.toggle('elementExpanded',  isActive);
        el.classList.toggle('elementCollapsed', !isActive);
    });

    cancelFunctions.get(prevID)?.();
    cancelFunctions.delete(prevID);

    // Clear old WASM container and re-init new one
    if (prevID) {
        const old = document.querySelector(`#wasm_${prevID}`);
        if (old) old.innerHTML = '';
    }
    const prog = data.programs.find(p => p.id === newID);
    if (prog) initProgram(prog, newID);
}

// initProgram // jsLink
async function initProgram(prog, programID) {
    const status = elementState.getStatus(programID);

    if (status === 'RUN') {
        const { init } = await import(new URL(prog.jsLink, window.location.origin).href);
        const cancel = await init(`#wasm_${programID}`, prog.wasmPath);
        cancelFunctions.set(programID, cancel);
        stateLog.commitStatus({ level: "INFO", message: `initProgram: running ${programID}` });
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