import { Emitter } from "./TypedEventEmitter";
import { Vec2 } from "./Vec2";

interface UserInputEvents {
  'primary-drag': (movement: Vec2) => void;
  'pinch-begin': (p1: Vec2, p2: Vec2) => void;
  'pinch-move': (p1: Vec2, p2: Vec2) => void;
}

export class UserInput extends Emitter<UserInputEvents> {
  get keys() { return makeReadonly(this._keys); }
  get pointer() { return makeReadonly(this._pointer); }

  private _keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    q: false,
    e: false
  }

  private _pointer = {
    position: Vec2.ZERO,
    primary_drag: Vec2.ZERO,

    primary: false,
    secondary: false,
    auxiliary: false
  }

  private _pointer_meta = {
    primary_drag_begin: Vec2.ZERO,
    positions: new Map<number, Vec2>()
  }

  constructor(private element: HTMLElement) {
    super();
    this.element.addEventListener('keydown', this.keydown);
    this.element.addEventListener('keyup', this.keyup);
    this.element.addEventListener('pointermove', this.pointermove);
    this.element.addEventListener('pointerdown', this.pointerdown);
    this.element.addEventListener('pointerup', this.pointerup);
    this.element.addEventListener('pointerleave', this.pointerup);
    this.element.addEventListener('pointerout', this.pointerup);
    this.element.addEventListener('pointercancel', this.pointerup);
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

  private pointermove = (e: PointerEvent) => {
    e.preventDefault();

    this._pointer_meta.positions.set(e.pointerId, new Vec2(e.clientX, e.clientY));

    if (this._pointer.primary && this._pointer_meta.positions.size === 1) {
      this._pointer.position = new Vec2(e.clientX, e.clientY);
      this._pointer.primary_drag = this._pointer.position.substract(this._pointer_meta.primary_drag_begin);      
    }

    if (this._pointer_meta.positions.size === 2) {
      const [p1, p2] = this._pointer_meta.positions.values();
      this.emit('pinch-move', p1, p2);
    }
  }

  private pointerdown = (e: PointerEvent) => {
    e.preventDefault();

    switch (e.button) {
      case 0:
        this._pointer.primary = true;
        this._pointer_meta.primary_drag_begin = new Vec2(e.clientX, e.clientY);
        this._pointer_meta.positions.set(e.pointerId, new Vec2(e.clientX, e.clientY));
        break;
      case 1:
        this._pointer.auxiliary = true;
      break;
      case 2:
        this._pointer.secondary = true;
      break;
    }

    if (this._pointer_meta.positions.size === 2) {
      const [p1, p2] = this._pointer_meta.positions.values();
      this.emit('pinch-begin', p1, p2);
    }
  }
  
  private pointerup = (e: PointerEvent) => {
    e.preventDefault();

    switch (e.button) {
      case 0:
        this._pointer.primary = false;
        this.emit('primary-drag', this._pointer.primary_drag);
        this._pointer_meta.primary_drag_begin = Vec2.ZERO;
        this._pointer.primary_drag = Vec2.ZERO;
        this._pointer_meta.positions.delete(e.pointerId);
        break;
      case 1:
        this._pointer.auxiliary = false;
      break;
      case 2:
        this._pointer.secondary = false;
      break;
    }
  }
}

function makeReadonly<T>(o: T): Readonly<T> { return o; }
