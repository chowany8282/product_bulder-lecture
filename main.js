document.addEventListener('DOMContentLoaded', () => {
  const lottoDisplay = document.querySelector('.lotto-display');
  const generateBtn = document.querySelector('.generate-btn');

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

  generateBtn.addEventListener('click', () => {
    const numbers = generateLottoNumbers();
    displayNumbers(numbers);
  });

  // Initial generation
  displayNumbers(generateLottoNumbers());
});
