import { StateBranch } from "./utils.js";

// Start exception logger
const stateLog = new StateBranch("Create StateBranch", "INFO");

class Element {
    constructor(data) {
        this.data = new Map(Object.entries(data));
    }

    getProperty(property){
        if (this.data.has(property))
            return this.data.get(property);
        return stateLog.commitStatus({level: "WARN", message: "Element.getProperty: Property not found."});
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
        `;
        col.appendChild(node);
    }
}

const data = await loadElements();
displayElements('.elementColumn', data);