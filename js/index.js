const blockContainerDOM = document.getElementById("block-container");
const inodeContainerDOM = document.getElementById("inode-container");
const detailContentDOM = document.getElementById("detail-content");


let image;
let superBlock;
let inodes;
let blocks;

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
    blocks = new Array(superBlock.nblocks);

    blocks[0] = new UnusedBlock(0);
    blocks[1] = superBlock;

    let i = 2;

    while (i < 2 + superBlock.ninodeblocks)
        blocks[i] = new InodeBlock(i++);

    blocks[i] = new UnusedBlock(i++);
    blocks[i] = new BitmapBlock(i++);

    while (i < superBlock.nblocks)
        blocks[i] = new DataBlock(i++);
}

function initInodes() {
    inodes = Array.from(new Array(superBlock.ninodes).keys(), i => new Inode(i));
}

function renderGrid() {
    inodeContainerDOM.innerHTML = "";
    blockContainerDOM.innerHTML = "";
    inodes.forEach(e => e.renderGrid());
    blocks.forEach(e => e.renderGrid());
}
