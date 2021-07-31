import { Vec2 } from "@lib/Vec2";

export class GolDrawer {
  constructor(
    private ctx: CanvasRenderingContext2D
  ) {}

  public drawCells(life: Vec2[], offset: Vec2, scale: number) {
    this.ctx.save();
    this.ctx.translate(offset.x, offset.y);
    this.ctx.scale(scale, scale);

    this.ctx.fillStyle = "gray";
    life.forEach(({ x, y }) => {
      this.ctx.fillRect(x, y, 1, 1);
    });

    this.ctx.restore();
  }

  public drawGrid(offset: Vec2, scale: number) {
    this.ctx.save();
    this.ctx.translate(offset.x, offset.y);

    const canvas_size = new Vec2(this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
    const cell_count = canvas_size.divide(scale).map(Math.floor).add(Vec2.ONE);
    const top_left = offset.divide(-scale).map(Math.floor);
    const bot_right = top_left.add(cell_count);

    const shade = 255 - 7.5 * (scale - 1);
    const gridColor = `rgb(${shade}, ${shade}, ${shade})`;
    
    for (let i = top_left.x; i <= bot_right.x; i++) {
      const top = Vec2.UNIT_I.scale(i * scale).substract(Vec2.UNIT_J.scale(offset.y));
      const bot = top.add(Vec2.UNIT_J.scale(canvas_size.y));
      this.drawLine(top, bot, gridColor);
    }

    for (let j = top_left.y; j <= bot_right.y; j++) {
      const left = Vec2.UNIT_J.scale(j * scale).substract(Vec2.UNIT_I.scale(offset.x));
      const right = left.add(Vec2.UNIT_I.scale(canvas_size.x));
      this.drawLine(left, right, gridColor);
    }

    this.ctx.restore();
  }

  public drawAxis(offset: Vec2) {
    this.ctx.save();
    this.ctx.translate(offset.x, offset.y);

    const canvas_size = new Vec2(this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);

    const left = Vec2.ZERO.substract(Vec2.UNIT_I.scale(offset.x));
    const right = left.add(Vec2.UNIT_I.scale(canvas_size.x));

    const top = Vec2.ZERO.substract(Vec2.UNIT_J.scale(offset.y));
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
}