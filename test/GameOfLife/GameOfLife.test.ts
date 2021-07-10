
describe('Game of Life', () => {
  test('When simulating life with no cells alive, then it remains lifeless', () => {
    const life = simulateLife([]);

    expect(life).toEqual([]);
  });
});
