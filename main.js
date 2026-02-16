class LogAnalyzer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._logs = [];
    this._debouncedFilter = this.debounce(this._filterAndRender, 200);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --background-color: #1a1a1a;
          --text-color: #e0e0e0;
          --header-bg: #2c3e50;
          --header-color: #ecf0f1;
          --input-bg: #2c3e50;
          --input-border: #34495e;
          --results-bg: #1c1c1c;
          --highlight-bg: #f39c12;
          --highlight-color: #1c1c1c;
          --scrollbar-bg: #2c3e50;
          --scrollbar-thumb: #34495e;
          --stats-color: #95a5a6;
        }

        .log-analyzer-wrapper {
          display: grid;
          grid-template-rows: auto 1fr;
          height: calc(100vh - 120px);
          gap: 1rem;
        }

        .controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-bar, .log-input {
          width: 100%;
          background-color: var(--input-bg);
          color: var(--text-color);
          border: 1px solid var(--input-border);
          border-radius: 5px;
          padding: 0.75rem;
          font-family: 'Menlo', 'Consolas', 'Monaco', monospace;
          font-size: 1rem;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .search-bar:focus, .log-input:focus {
          outline: none;
          border-color: var(--highlight-bg);
          box-shadow: 0 0 5px rgba(243, 156, 18, 0.5);
        }

        .log-input {
          resize: vertical;
          min-height: 150px;
        }

        .stats {
          font-size: 0.9rem;
          color: var(--stats-color);
          text-align: right;
          padding: 0 0.5rem;
        }

        .results {
          background-color: var(--results-bg);
          border: 1px solid var(--input-border);
          border-radius: 5px;
          overflow-y: auto;
          padding: 0.5rem;
          height: 100%;
        }

        .log-line {
          padding: 0.25rem 0.5rem;
          white-space: pre-wrap;
          word-break: break-all;
          font-size: 0.85rem;
          line-height: 1.6;
        }

        .log-line:nth-child(even) {
          background-color: rgba(0,0,0,0.2);
        }

        .log-line mark {
          background-color: var(--highlight-bg);
          color: var(--highlight-color);
          border-radius: 3px;
          padding: 0.1em;
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      </style>
      <div class="log-analyzer-wrapper">
        <div class="controls">
            <textarea class="log-input" placeholder="Paste Cisco logs here..."></textarea>
            <input type="search" class="search-bar" placeholder="Search logs...">
            <div class="stats"></div>
        </div>
        <div class="results"></div>
      </div>
    `;

    this._logInput = this.shadowRoot.querySelector('.log-input');
    this._searchInput = this.shadowRoot.querySelector('.search-bar');
    this._resultsContainer = this.shadowRoot.querySelector('.results');
    this._statsContainer = this.shadowRoot.querySelector('.stats');
    
    this._logInput.addEventListener('input', this._onInput.bind(this));
    this._searchInput.addEventListener('input', this._onInput.bind(this));

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
