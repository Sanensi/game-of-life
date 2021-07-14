import { Vec2 } from "./Vec2";

export function simulateLife(aliveCells: Vec2[]): Vec2[] {
  const previousCellMap = CellMap.fromAliveCells(aliveCells);
  const nextCellMap = CellMap.fromAliveCells(aliveCells);
  
  aliveCells.forEach((cell) => {
    const aliveNeighbors = previousCellMap.getAliveNeighbors(cell);

    if (aliveNeighbors.length < 2 || aliveNeighbors.length > 3) {
      nextCellMap.setDead(cell);
    }

    cell.neighbors().forEach((neighbor) => {
      if (previousCellMap.getAliveNeighbors(neighbor).length === 3) {
        nextCellMap.setAlive(neighbor);
      }
    });
  });

  return nextCellMap.getAliveCells();
}

class CellMap {
  constructor(
    private cells: Map<string, Vec2>
  ) { }

  static fromAliveCells(aliveCells: Vec2[]): CellMap {
    const entries = aliveCells.map((cell) => [CellMap.getKey(cell), cell] as const);
  
    return new CellMap(new Map(entries));
  }

  setAlive(cell: Vec2) {
    this.cells.set(CellMap.getKey(cell), cell);
  }

  setDead(cell: Vec2) {
    this.cells.delete(CellMap.getKey(cell));
  }

  getAliveCells(): Vec2[] {
    return [...this.cells.values()];
  }

  getAliveNeighbors(cell: Vec2) {
    return cell.neighbors().filter((neighbor) => this.isCellAlive(neighbor));
  }

  private isCellAlive(cell: Vec2) {
    return this.cells.has(CellMap.getKey(cell));
  } 
  
  private static getKey(cell: Vec2) {
    return `${cell.x},${cell.y}`;
  }
}
