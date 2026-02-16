document.addEventListener('DOMContentLoaded', () => {
  const lottoDisplay = document.querySelector('.lotto-display');
  const generateBtn = document.querySelector('.generate-btn');
  const themeBtn = document.querySelector('.theme-btn');
  const html = document.documentElement;

  let isDarkMode = false;

  function generateLottoNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  }

  function displayNumbers(numbers) {
    lottoDisplay.innerHTML = '';
    numbers.forEach(number => {
      const numberElement = document.createElement('div');
      numberElement.classList.add('lotto-number');
      numberElement.textContent = number;
      lottoDisplay.appendChild(numberElement);
    });
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
    }
  }

  generateBtn.addEventListener('click', () => {
    const numbers = generateLottoNumbers();
    displayNumbers(numbers);
  });

  themeBtn.addEventListener('click', toggleTheme);

  // Initial generation
  displayNumbers(generateLottoNumbers());
});
