let image;
let superBlock;

let inodeList;
let blockList;

async function main(file) {
    image = await loadImage(file);

    initBlocks();
    initInodes();
    renderGrid();
}

async function loadImage(file) {
    if (file instanceof File) { // local file
        const reader = new FileReader();
        return await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsArrayBuffer(file);
        });
    } else { // remote file
        const response = await fetch(file);
        return await response.arrayBuffer();
    }
}

function initBlocks() {
    superBlock = new SuperBlock(1);
    blockList = new Array(superBlock.nblocks);

    blockList[0] = new UnusedBlock(0);
    blockList[1] = superBlock;

    let i = 2;

    while (i < 2 + superBlock.ninodeblocks)
        blockList[i] = new InodeBlock(i++);

    blockList[i] = new UnusedBlock(i++);
    blockList[i] = new BitmapBlock(i++);

    while (i < superBlock.nblocks)
        blockList[i] = new DataBlock(i++);
}

function initInodes() {
    inodeList = Array.from(new Array(superBlock.ninodes).keys(), i => new Inode(i));
}

function renderGrid() {
    inodeContainer.innerHTML = "";
    blockContainer.innerHTML = "";
    inodeList.forEach(e => e.renderGrid());
    blockList.forEach(e => e.renderGrid());
}
