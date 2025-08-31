describe('Teste Simples', () => {
  test('deve passar sempre', () => {
    expect(1 + 1).toBe(2);
  });

  test('deve verificar se o Jest está funcionando', () => {
    expect(true).toBe(true);
  });

  test('deve verificar operações básicas', () => {
    expect(10 + 5).toBe(15);
    expect(10 - 5).toBe(5);
    expect(10 * 5).toBe(50);
    expect(10 / 5).toBe(2);
  });
});
