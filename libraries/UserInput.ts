
export class UserInput {
  get keys() { return makeReadonly(this._keys); }

  private _keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    q: false,
    e: false
  }

  constructor(private element: HTMLElement) {
    this.element.addEventListener('keydown', this.keydown);
    this.element.addEventListener('keyup', this.keyup);
  }

  public clearListeners() {
    this.element.removeEventListener('keyup', this.keyup);
    this.element.removeEventListener('keydown', this.keydown);
  }

  private keydown = (e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case "arrowup":
      case "w":
        this._keys.up = true;
        break;
      case "arrowdown":
      case "s":
        this._keys.down = true;
        break;
      case "arrowleft":
      case "a":
        this._keys.left = true;
        break;
      case "arrowright":
      case "d":
        this._keys.right = true;
        break;
      case "q":
        this._keys.q = true;
        break;
      case "e":
        this._keys.e = true;
        break;
    }
  }

  private keyup = (e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case "arrowup":
      case "w":
        this._keys.up = false;
        break;
      case "arrowdown":
      case "s":
        this._keys.down = false;
        break;
      case "arrowleft":
      case "a":
        this._keys.left = false;
        break;
      case "arrowright":
      case "d":
        this._keys.right = false;
        break;
      case "q":
        this._keys.q = false;
        break;
      case "e":
        this._keys.e = false;
        break;
    }
  }
}

function makeReadonly<T>(o: T): Readonly<T> { return o; }
