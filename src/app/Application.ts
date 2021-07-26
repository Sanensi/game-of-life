import { ApplicationBase } from "@lib/ApplicationBase";
import { Vec2 } from "@lib/Vec2";
import { simulateLife } from "@gol/GameOfLife";
import { UserInput } from "@lib/UserInput";

export class Application extends ApplicationBase {
  private life: Vec2[] = [];
  private stepsPerSecond = 10;
  private previousStep_ts = 0;

  private step_count = 0;

  private scale = 10;
  private offset = Vec2.ZERO;

  private input: UserInput;
  private speed = 10;
  private zoom_speed = 1.05;

  constructor(c: HTMLCanvasElement) {
    super(c);
    this.input = new UserInput(c);
  }

  protected start() {
    // cells in [250.. 500[
    const cells = Math.floor(250 * Math.random()) + 250;

    for (let i = 0; i <= cells; i++) {
      // cell position in [-25, 25[
      const x = Math.floor(50 * Math.random()) - 25;
      const y = Math.floor(50 * Math.random()) - 25;

      this.life.push(new Vec2(x, y));
    }

    this.offset = new Vec2(this.canvas.clientWidth/2, this.canvas.clientHeight/2);
  }

  protected update(ts: number) {
    if ((ts - this.previousStep_ts) / 1000 > 1 / this.stepsPerSecond) {
      this.life = simulateLife(this.life);
      this.previousStep_ts = ts;
      this.step_count++;
    }

    if (this.input.keys.right) this.offset = this.offset.substract(Vec2.UNIT_I.scale(this.speed));
    if (this.input.keys.left) this.offset = this.offset.add(Vec2.UNIT_I.scale(this.speed));
    if (this.input.keys.up) this.offset = this.offset.add(Vec2.UNIT_J.scale(this.speed));
    if (this.input.keys.down) this.offset = this.offset.substract(Vec2.UNIT_J.scale(this.speed));

    const focus_point = this.screenToGameSpace(new Vec2(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2));
    
    if (this.input.keys.e) {
      const zoom_offset = focus_point.scale(this.scale);
      this.scale *= this.zoom_speed;
      this.offset = this.offset.substract(zoom_offset.scale(this.zoom_speed).substract(zoom_offset));
    }
    if (this.input.keys.q) {
      this.scale /= this.zoom_speed;
      const zoom_offset = focus_point.scale(this.scale);
      this.offset = this.offset.add(zoom_offset.scale(this.zoom_speed).substract(zoom_offset));
    }
  }

  protected draw() {
    this.clear();
    
    this.scale > 1 && this.drawGrid();
    this.drawCells();
    this.drawAxis();

    const focus_point = this.screenToGameSpace(new Vec2(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2));

    this.ctx.fillText(`fps: ${(1000 / this.delta).toFixed(1)}`, 5, 10);
    this.ctx.fillText(`gen: ${this.step_count}`, 5, 20);
    this.ctx.fillText(`{ x: ${focus_point.x.toFixed(2)}, y: ${focus_point.y.toFixed(2)} }`, 5, 30);
    this.ctx.fillText(`scale: ${this.scale.toPrecision(3)}`, 5, 40);
  }

  private drawCells() {
    this.ctx.save();
    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.scale(this.scale, this.scale);

    this.ctx.fillStyle = "gray";
    this.life.forEach(({ x, y }) => {
      this.ctx.fillRect(x, y, 1, 1);
    });

    this.ctx.restore();
  }

  private drawGrid() {
    this.ctx.save();
    this.ctx.translate(this.offset.x, this.offset.y);

    const canvas_size = new Vec2(this.canvas.clientWidth, this.canvas.clientHeight);
    const cell_count = canvas_size.divide(this.scale).map(Math.floor).add(Vec2.ONE);
    const top_left = this.offset.divide(-this.scale).map(Math.floor);
    const bot_right = top_left.add(cell_count);

    const shade = 255 - 7.5 * (this.scale - 1);
    const gridColor = `rgb(${shade}, ${shade}, ${shade})`;
    
    for (let i = top_left.x; i <= bot_right.x; i++) {
      const top = Vec2.UNIT_I.scale(i * this.scale).substract(Vec2.UNIT_J.scale(this.offset.y));
      const bot = top.add(Vec2.UNIT_J.scale(canvas_size.y));
      this.drawLine(top, bot, gridColor);
    }

    for (let j = top_left.y; j <= bot_right.y; j++) {
      const left = Vec2.UNIT_J.scale(j * this.scale).substract(Vec2.UNIT_I.scale(this.offset.x));
      const right = left.add(Vec2.UNIT_I.scale(canvas_size.x));
      this.drawLine(left, right, gridColor);
    }

    this.ctx.restore();
  }

  private drawAxis() {
    this.ctx.save();
    this.ctx.translate(this.offset.x, this.offset.y);

    const canvas_size = new Vec2(this.canvas.clientWidth, this.canvas.clientHeight);

    const left = Vec2.ZERO.substract(Vec2.UNIT_I.scale(this.offset.x));
    const right = left.add(Vec2.UNIT_I.scale(canvas_size.x));

    const top = Vec2.ZERO.substract(Vec2.UNIT_J.scale(this.offset.y));
    const bot = top.add(Vec2.UNIT_J.scale(canvas_size.y));

    this.drawLine(left, right, "red");
    this.drawLine(top, bot, "blue");

    this.ctx.restore();
  }

  private drawLine(from: Vec2, to: Vec2, color = "black") {
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  private screenToGameSpace(p: Vec2) {
    return p.substract(this.offset).scale(1 / this.scale);
  }
}