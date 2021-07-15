import { ApplicationBase } from "@lib/ApplicationBase";
import { Vec2 } from "@lib/Vec2";
import { simulateLife } from "@gol/GameOfLife";

export class Application extends ApplicationBase {
  private life: Vec2[] = [];

  private scale = 10;
  private offset = Vec2.ZERO;

  start() {
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

  update() {
    this.life = simulateLife(this.life);
  }

  draw() {
    this.clear();
    this.life.forEach((cell) => {
      const { x, y } = cell.scale(this.scale).add(this.offset);
      this.ctx.fillRect(x, y, this.scale, this.scale);
    });

    this.ctx.fillText(`fps: ${(1000 / this.delta).toFixed(1)}`, 10, 10);
  }
}