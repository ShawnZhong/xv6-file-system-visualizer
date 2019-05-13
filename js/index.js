let image;

async function main(file) {
    image = await loadImage(file);

    BlockUtils.initBlockList();
    InodeUtils.initInodeList();

    FileTree.render();
    BlockUtils.render();
    InodeUtils.render();
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