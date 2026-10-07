export function normalizeOkedCode(code: string): string {
  return (code || '')
    .trim()
    .replace(/,/g, '.')
    .replace(/\s+/g, '');
}

export function okedHierarchyMatches(userCode: string, matrixCode: string): boolean {
  const user = normalizeOkedCode(userCode);
  const matrix = normalizeOkedCode(matrixCode);

  if (!user || !matrix) return false;
  if (user === matrix) return true;

  // Матрица МИО часто содержит укрупненные группы (например 56.1),
  // а пользователь вводит детальный подкласс (например 56.101).
  if (user.startsWith(matrix + '.') || user.startsWith(matrix)) return true;

  // Если пользователь ввел более широкий код, считаем это предварительным
  // совпадением с более детальной записью матрицы.
  if (matrix.startsWith(user + '.') || matrix.startsWith(user)) return true;

  return false;
}
