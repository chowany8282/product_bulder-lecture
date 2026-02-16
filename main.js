class LogAnalyzer extends HTMLElement {
  constructor() {
    super();
    this._logs = [];
    this._debouncedFilter = this.debounce(this._filterAndRender, 200);
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="log-analyzer-container">
        <div class="log-analyzer-wrapper">
          <div class="controls">
            <div class="input-group">
              <label for="log-input">Log Data</label>
              <textarea id="log-input" class="log-input" placeholder="Paste Cisco logs here..."></textarea>
            </div>
            <div class="input-group">
              <label for="search-bar">Search</label>
              <div class="search-wrapper">
                <input type="search" id="search-bar" class="search-bar" placeholder="Filter logs...">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              </div>
            </div>
            <div class="stats"></div>
          </div>
          <div class="results-wrapper">
            <div class="results-header">Results</div>
            <div class="results"></div>
          </div>
        </div>
        <div class="details-pane hidden">
          <div class="details-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1-8h-2V7h2v2z"/></svg>
              Log Analysis
            </h3>
            <button class="close-btn">&times;</button>
          </div>
          <div class="details-content"></div>
        </div>
      </div>
    `;

    this._logInput = this.querySelector('.log-input');
    this._searchInput = this.querySelector('.search-bar');
    this._resultsContainer = this.querySelector('.results');
    this._statsContainer = this.querySelector('.stats');
    this._detailsPane = this.querySelector('.details-pane');
    this._detailsContent = this.querySelector('.details-content');
    this._closeDetailsBtn = this.querySelector('.close-btn');
    
    this._logInput.addEventListener('input', this._onInput.bind(this));
    this._searchInput.addEventListener('input', this._onInput.bind(this));
    this._resultsContainer.addEventListener('click', this._onLogClick.bind(this));
    this._closeDetailsBtn.addEventListener('click', () => this._detailsPane.classList.add('hidden'));

    this._filterAndRender(); // Initial render
  }

  _onInput() {
    this._logs = this._logInput.value.split('\n').filter(line => line.trim() !== '');
    this._debouncedFilter();
  }
  
  _filterAndRender() {
    const query = this._searchInput.value.trim().toLowerCase();
    
    if (!this._logs.length) {
      this._resultsContainer.innerHTML = '';
      this._statsContainer.textContent = '0 total lines';
      return;
    }

    const fragment = document.createDocumentFragment();
    let matchCount = 0;

    const filteredLogs = this._logs.filter(line => {
        return query === '' || line.toLowerCase().includes(query);
    });
    
    matchCount = filteredLogs.length;

    filteredLogs.forEach(line => {
      const lineEl = document.createElement('div');
      lineEl.className = 'log-line';
      
      if (query) {
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        lineEl.innerHTML = line.replace(regex, '<mark>$1</mark>');
      } else {
        lineEl.textContent = line;
      }
      fragment.appendChild(lineEl);
    });

    this._resultsContainer.innerHTML = '';
    this._resultsContainer.appendChild(fragment);
    this._statsContainer.textContent = `${matchCount} matching lines / ${this._logs.length} total lines`;
  }

  async _onLogClick(event) {
    const target = event.target.closest('.log-line');
    if (!target) return;
    
    // Highlight selected
    this.shadowRoot.querySelectorAll('.log-line.selected').forEach(el => el.classList.remove('selected'));
    target.classList.add('selected');

    const logMessage = target.textContent;
    this._detailsPane.classList.remove('hidden');
    this._detailsContent.innerHTML = '<div class="loading">Analyzing with Gemini...</div>';
    
    try {
        const analysis = await this._fetchAnalysis(logMessage);
        this._detailsContent.textContent = analysis;
    } catch (error) {
        this._detailsContent.textContent = `Error: ${error.message}`;
    }
  }

  async _fetchAnalysis(log) {
    const apiBaseUrl = window.GEMINI_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiBaseUrl}/analyze-log`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ log })
    });

    if (!response.ok) {
        // Try to parse the error as JSON, but fall back to text if that fails
        const errorText = await response.text();
        let errorMessage = 'Failed to fetch analysis.';
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            // The error response was not valid JSON
            console.error("Could not parse error response as JSON:", errorText);
            // We can use the raw text as a fallback
            errorMessage = `Server returned an error: ${response.status} ${response.statusText}. Response: ${errorText}`;
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.analysis;
  }

  debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
  }
}

customElements.define('log-analyzer', LogAnalyzer);
