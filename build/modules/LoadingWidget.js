export default class LoadingWidget {
    constructor(parent) {
        var _a;
        this.minimumLoadTime = 500;
        this.runtime = 0;
        this.parent = parent;
        this.container = (_a = document.getElementById("menu-container")) !== null && _a !== void 0 ? _a : document.createElement("error");
        this.container.style.display = "block";
        this.widget = document.createElement("img");
        this.widget.src = "assets/recycle.svg";
        this.widget.id = "loader-widget";
        this.widget.alt = "Loading...";
        this.container.appendChild(this.widget);
    }
    // Update function called every render; returns true when done loading
    Update(delta) {
        this.runtime += delta;
        return (!this.parent.loading && (this.runtime >= this.minimumLoadTime));
    }
}
