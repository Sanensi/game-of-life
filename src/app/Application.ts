import { ApplicationBase } from "@lib/ApplicationBase";
import { Vec2 } from "@lib/Vec2";
import { simulateLife } from "@gol/GameOfLife";
import { UserInput } from "@lib/UserInput";
import { GolDrawer } from "./GolDrawer";

export class Application extends ApplicationBase {
  private readonly drawer: GolDrawer;
  private input: UserInput;

  private life: Vec2[] = [];
  private stepsPerSecond = 0;
  private previousStep_ts = 0;
  private step_count = 0;

  private scale = 10;
  private base_offset = Vec2.ZERO;
  private movement_offset = Vec2.ZERO;
  private previous_pinch = 0;

  private readonly movement_speed = 10;
  private readonly keyboard_zoom_speed = 1.05;
  private readonly wheel_zoom_speed = 1.10;

  private get total_offset() {
    return this.base_offset
      .add(this.movement_offset)
      .add(this.input.pointer.primary_drag);
  }

  constructor(c: HTMLCanvasElement) {
    super(c);
    this.drawer = new GolDrawer(this.ctx);

    this.input = new UserInput(c);
    
    this.input.on('primary-drag', (movement) => {
      this.movement_offset = this.movement_offset.add(movement);
    });
    
    this.input.on('pinch-begin', (p1, p2) => {
      this.previous_pinch = p2.substract(p1).length();
    });

    this.input.on('pinch-move', (p1, p2) => {
      const center = p1.add(p2.substract(p1).scale(0.5));
      const focus = this.screenToGameSpace(center);
      const pinch = p2.substract(p1).length();
      const factor = pinch / this.previous_pinch;

      this.zoomIn(focus, factor);

      this.previous_pinch = pinch;
    });

    this.canvas.addEventListener('wheel', (e) => {
      const focus = this.screenToGameSpace(new Vec2(e.clientX, e.clientY));
      if (e.deltaY < 0) this.zoomIn(focus, this.wheel_zoom_speed);
      if (e.deltaY > 0) this.zoomOut(focus, this.wheel_zoom_speed);
    });
  }

  protected start() {
    // cells in [250.. 500[
    const cells = Math.floor(250 * Math.random()) + 250;

    for (let i = 0; i <= cells; i++) {
      // cell position in [-25, 25[
      // const x = Math.floor(50 * Math.random()) - 25;
      // const y = Math.floor(50 * Math.random()) - 25;
      
      const r = Math.floor(25 * Math.random());
      const theta = Math.random() * 2 * Math.PI;

      const x = Math.floor(Math.cos(theta) * r);
      const y = Math.floor(Math.sin(theta) * r);

      this.life.push(new Vec2(x, y));
    }

    this.base_offset = new Vec2(this.canvas.clientWidth/2, this.canvas.clientHeight/2);
  }

  protected update(ts: number) {
    if ((ts - this.previousStep_ts) / 1000 > 1 / this.stepsPerSecond) {
      this.life = simulateLife(this.life);
      this.previousStep_ts = ts;
      this.step_count++;
    }

    if (this.input.keys.right) this.movement_offset = this.movement_offset.substract(Vec2.UNIT_I.scale(this.movement_speed));
    if (this.input.keys.left) this.movement_offset = this.movement_offset.add(Vec2.UNIT_I.scale(this.movement_speed));
    if (this.input.keys.up) this.movement_offset = this.movement_offset.add(Vec2.UNIT_J.scale(this.movement_speed));
    if (this.input.keys.down) this.movement_offset = this.movement_offset.substract(Vec2.UNIT_J.scale(this.movement_speed));

    const focus = this.screenToGameSpace(new Vec2(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2));  
    if (this.input.keys.e) this.zoomIn(focus, this.keyboard_zoom_speed);
    if (this.input.keys.q) this.zoomOut(focus, this.keyboard_zoom_speed);
  }

  protected draw() {
    this.clear();
    
    this.scale > 1 && this.drawer.drawGrid(this.total_offset, this.scale);
    this.drawer.drawCells(this.life, this.total_offset, this.scale);
    this.drawer.drawAxis(this.total_offset);

    const focus_point = this.screenToGameSpace(new Vec2(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2));

    this.ctx.fillText(`fps: ${(1000 / this.delta).toFixed(1)}`, 5, 10);
    this.ctx.fillText(`gen: ${this.step_count}`, 5, 20);
    this.ctx.fillText(`{ x: ${focus_point.x.toFixed(2)}, y: ${focus_point.y.toFixed(2)} }`, 5, 30);
    this.ctx.fillText(`scale: ${this.scale.toPrecision(3)}`, 5, 40);
  }

  private zoomIn(focus: Vec2, factor: number) {
    const zoom_offset = focus.scale(this.scale);
    this.scale *= factor;
    this.movement_offset = this.movement_offset.substract(zoom_offset.scale(factor).substract(zoom_offset));
  }

  private zoomOut(focus: Vec2, factor: number) {
    this.scale /= factor;
    const zoom_offset = focus.scale(this.scale);
    this.movement_offset = this.movement_offset.add(zoom_offset.scale(factor).substract(zoom_offset));
  }

  private screenToGameSpace(p: Vec2) {
    return p.substract(this.total_offset).scale(1 / this.scale);
  }
}