class Image {
    constructor(imageName) {
        this.element = document.createElement("div");

        this.inputElement = document.createElement("input");
        this.inputElement.name = 'file';
        this.inputElement.value = Config.imagePath + imageName;
        this.inputElement.type = 'radio';
        this.inputElement.id = imageName;
        this.inputElement.onchange = () => main(Config.imagePath + imageName);
        this.element.appendChild(this.inputElement);


        const textElement = document.createElement("pre");
        textElement.textContent = imageName;

        const labelElement = document.createElement("label");
        labelElement.htmlFor = imageName;
        labelElement.appendChild(textElement);

        this.element.appendChild(labelElement);
    }

    check() {
        this.inputElement.checked = true;
        this.inputElement.onchange();
    }

    uncheck() {
        this.inputElement.checked = false;
    }
}

const imageObjects = Config.imageNames.map(imageName => new Image(imageName));

imageObjects.forEach(image => Elements.imageListContainer.appendChild(image.element));
imageObjects[2].check();

Elements.fileUpload.onchange = (e) => {
    if (e.target.files.length === 0) return;
    imageObjects.forEach(e => e.uncheck());
    main(e.target.files[0]);
};