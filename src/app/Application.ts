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

    const speed = 10;
    const zoom_speed = 1.05;

    if (this.input.keys.right) this.offset = this.offset.substract(Vec2.UNIT_I.scale(speed));
    if (this.input.keys.left) this.offset = this.offset.add(Vec2.UNIT_I.scale(speed));
    if (this.input.keys.up) this.offset = this.offset.add(Vec2.UNIT_J.scale(speed));
    if (this.input.keys.down) this.offset = this.offset.substract(Vec2.UNIT_J.scale(speed));
    if (this.input.keys.e) this.scale *= zoom_speed;
    if (this.input.keys.q) this.scale /= zoom_speed;
  }

  protected draw() {
    this.clear();
    this.drawCells();
    this.drawGrid();
    this.ctx.fillText(`fps: ${(1000 / this.delta).toFixed(1)}`, 5, 10);
    this.ctx.fillText(`steps: ${this.step_count}`, 5, 20);
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

    const canvas_size = new Vec2(this.canvas.clientWidth, this.canvas.clientHeight);
    const cell_count = canvas_size.divide(this.scale).map(Math.floor).add(Vec2.ONE);
    const anti_offset = cell_count.divide(2).map(Math.floor).scale(-this.scale);

    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.translate(anti_offset.x, anti_offset.y);

    for (let i = 0; i <= cell_count.x; i++) {
      const top = Vec2.UNIT_I.scale(i * this.scale);
      const bot = top.add(Vec2.UNIT_J.scale(cell_count.y * this.scale));
      this.drawLine(top, bot, "gray");
    }

    for (let j = 0; j <= cell_count.y; j++) {
      const left = Vec2.UNIT_J.scale(j * this.scale);
      const right = left.add(Vec2.UNIT_I.scale(cell_count.x * this.scale));
      this.drawLine(left, right, "gray");
    }

    this.ctx.restore();
    this.ctx.save();

    this.ctx.translate(this.offset.x, this.offset.y);

    const origin = Vec2.ZERO;
    this.drawLine(origin, origin.add(Vec2.UNIT_I.scale(100)), "red");
    this.drawLine(origin, origin.add(Vec2.UNIT_J.scale(100)), "blue");

    this.ctx.restore();
  }

  private drawLine(from: Vec2, to: Vec2, color = "black") {
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }
}