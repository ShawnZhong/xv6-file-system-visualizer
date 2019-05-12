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
    superBlock = new SuperBlock();

    blocks = new Array(superBlock.nblocks);

    blocks[0] = new Block(0);
    blocks[1] = superBlock;
    for (let i = 2; i < 2 + superBlock.ninodeblocks; i++)
        blocks[i] = new InodeBlock(i);

    blocks[superBlock.ninodeblocks + 2] = new BitmapBlock();

    for (let i = superBlock.ninodeblocks + 3; i < superBlock.nblocks; i++)
        blocks[i] = new DataBlock(i);
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
