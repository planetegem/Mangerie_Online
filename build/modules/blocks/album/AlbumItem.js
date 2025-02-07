export default class AlbumItem {
    SetSelected(index) {
        this.selected = (this.album.index === index);
        this.selectButton.innerText = (this.selected) ? "selected" : "select";
        if (this.selected) {
            this.container.classList.add("selected");
        }
        else {
            this.container.classList.remove("selected");
        }
    }
    constructor(parent, album) {
        this.selected = false;
        this.album = album;
        this.parent = parent;
        this.container = document.createElement("li");
        this.container.classList.add("album-item");
        this.parent.albumList.appendChild(this.container);
        const title = document.createElement("h3");
        title.innerText = album.title;
        this.container.appendChild(title);
        const description = document.createElement("p");
        description.innerText = album.description;
        this.container.appendChild(description);
        const cover = document.createElement("img");
        cover.src = album.cover;
        this.container.appendChild(cover);
        this.selectButton = document.createElement("button");
        this.container.appendChild(this.selectButton);
        this.container.addEventListener("click", () => {
            this.parent.UpdateSelection(this.album.index);
        });
    }
}
