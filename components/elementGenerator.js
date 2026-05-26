async function loadElements(targetSelector) {
    const [{ elements }, { programs }] = await Promise.all([
        fetch('./components/elementGenerator.json').then(r => r.json()),
        fetch('./components/programIndex.json').then(r => r.json())
    ]);

    const col = document.querySelector(targetSelector);

    for (const el of elements) {
        const programID = el.mainProgramID ?? el.programID ?? null;
        const prog = programs.find(p => p.id === programID);

        if (prog?.status === 'run') {
            // WebAssembly.instantiateStreaming(fetch(prog.wasmPath), ...)
        } 
        // next if statement for preloading if status == 'load'

        const node = document.createElement('div');
        node.className = 'element';
        if (programID) node.dataset.programId = programID;
        node.innerHTML = `
            <p class="element__title">${el.title}</p>
            <p class="element__lang">${el.lang}</p>
            <p class="element__subtitle">${el.subTitle}</p>
            <p class="element__desc">${el.description}</p>
        `;
        col.appendChild(node);
    }
}

loadElements('.elementColumn');