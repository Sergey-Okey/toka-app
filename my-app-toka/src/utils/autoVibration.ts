export function enableAutoVibration(): void {
  // Настройка вибрации для всех кликабельных элементов
  const handleVibration = (e: MouseEvent | TouchEvent): void => {
    const target = e.target as HTMLElement;
    const tag = target.tagName.toLowerCase();

    // Определение интерактивных элементов (кнопки, ссылки и другие элементы)
    const isInteractive =
      ['button', 'a', 'input', 'textarea', 'select', 'label'].includes(tag) ||
      target.getAttribute('role') === 'button' ||
      target.onclick;

    // Если элемент интерактивный и поддерживает вибрацию
    if (isInteractive && navigator.vibrate) {
      navigator.vibrate(10); // Длительность вибрации в миллисекундах
    }
  };

  // Добавление обработчиков на mousedown и touchstart
  document.addEventListener('mousedown', handleVibration);
  document.addEventListener('touchstart', handleVibration);
}
