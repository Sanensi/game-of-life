export abstract class ApplicationBase {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  
  private previous_ts = 0;
  protected delta = 0;

  constructor(c: HTMLCanvasElement) {
    this.canvas = c;
    
    const ctx = c.getContext("2d");
    if (ctx === null) throw new Error("Could not get a CanvasRenderingContext2D from the HTMLCanvasElement");

    this.ctx = ctx;
  }

  protected start() { };

  protected update(ts: number) { };

  protected draw() { };

  protected resize(w: number, h: number) { }

  protected clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private updateDelta(ts: number) {
    this.delta = ts - this.previous_ts;
    this.previous_ts = ts;
  }

  public init() {
    const animate = (ts: number) => {
      this.updateDelta(ts);
      this.update(ts);
      this.draw();

      requestAnimationFrame(animate);
    }

    const resize = () => {
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;

      this.canvas.width = w;
      this.canvas.height = h;

      this.resize(w, h);
      this.draw();
    }

    window.addEventListener('resize', resize);

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.start();
    resize();
    animate(0);
  }
}