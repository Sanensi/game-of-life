import { simulateLife } from "@gol/GameOfLife";
import { Vec2 } from "@lib/Vec2";

describe('Game of Life', () => {
  test('When simulating life with no cells alive, then it remains lifeless', () => {
    const life = simulateLife([]);

    expect(life).toEqual([]);
  });
  
  test('Given a cell with less than two neighbors, when simulating life, then it should die', () => {
    const lonelyCell = Vec2.ZERO;
    const cells: Vec2[] = [
      lonelyCell,
      Vec2.UNIT_I
    ];

    const life = simulateLife(cells);

    expect(life).not.toContainEqual<Vec2>(lonelyCell);
  });

  test('Given a cell with two or three neighbors, when simulating life, then it should remain alive', () => {
    const happyCell = Vec2.ZERO;
    const cells = [
      happyCell,
      Vec2.UNIT_I,
      Vec2.UNIT_J
    ];

    const life = simulateLife(cells);
    
    expect(life).toContainEqual<Vec2>(happyCell);
  });

  test('Given a cell with more than three neighbors, when simulating life, then it should die', () => {
    const overCrowdedCell = Vec2.ZERO;
    const cells = [
      overCrowdedCell,
      ...overCrowdedCell.neighbors()
    ];

    const life = simulateLife(cells);

    expect(life).not.toContainEqual(overCrowdedCell);
  });

  test('Given a position with three neighbors, when simulating life, then that cell becomes alive', () => {
    const aPosition = Vec2.ZERO;
    const neighbors = [
      aPosition.add(Vec2.UNIT_I),
      aPosition.add(Vec2.UNIT_J),
      aPosition.add(Vec2.ONE)
    ];

    const life = simulateLife(neighbors);

    expect(life).toContainEqual(aPosition);
  });
});
