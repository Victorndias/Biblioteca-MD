
let books = [];

const API_URL = 'https://biblioteca-md.onrender.com/api/books';

async function loadBooks() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Erro ao carregar os livros.');
    }

    books = await response.json();
    return books;
  } catch (error) {
    console.error('Erro ao conectar com a API:', error);
    alert('Não foi possível carregar o catálogo. Tente novamente.');
    return [];
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function createBookCard(book) {
  const availability = book.digitalAvailable
    ? '<span class="status-pill">Leitura digital</span>'
    : '<span class="status-pill physical">Acervo físico</span>';

  let action;
  if (book.digitalAvailable) {
    action = `<a class="small-link" href="leitor.html?livro=${encodeURIComponent(book.id)}">Ler online →</a>`;
  } else if (book.physicalLoanAvailable) {
    action = `<a class="small-link loan-link" href="solicitar-emprestimo.html?livro=${encodeURIComponent(book.id)}">Solicitar empréstimo</a>`;
  } else {
    action = '<span class="small-link disabled">Indisponível</span>';
  }

  return `
    <article class="book-card">
      <div class="cover-wrap">
        <div class="book-cover" style="--cover: ${escapeHtml(book.coverColor)}" aria-label="Capa ilustrativa de ${escapeHtml(book.title)}">
          <span class="cover-kicker">Biblioteca Municipal</span>
          <span class="cover-title">${escapeHtml(book.title)}</span>
          <span class="cover-author">${escapeHtml(book.author)}</span>
        </div>
      </div>
      <div class="book-info">
        <span class="book-category">${escapeHtml(book.category)}</span>
        <h3>${escapeHtml(book.title)}</h3>
        <p class="book-author">${escapeHtml(book.author)} · ${escapeHtml(book.year)}</p>
        <div class="book-card-bottom">${availability}${action}</div>
      </div>
    </article>`;
}

function setupMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });
}

async function setupHomePage() {
  const featured = document.getElementById('featuredBooks');

  if (featured) {
    await loadBooks();
    featured.innerHTML = books.slice(0, 4).map(createBookCard).join('');
  }

  const form = document.getElementById('homeSearch');
  const input = document.getElementById('homeQuery');

  if (form && input) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = input.value.trim();
      window.location.href = `catalogo.html?q=${encodeURIComponent(query)}`;
    });
  }
}


async function setupCatalogPage() {
  const list = document.getElementById('catalogBooks');
  if (!list) return;

  const queryInput = document.getElementById('catalogQuery');
  const categorySelect = document.getElementById('categoryFilter');
  const availabilitySelect = document.getElementById('availabilityFilter');
  const resultsCount = document.getElementById('resultsCount');
  const emptyState = document.getElementById('emptyState');
  const clearButton = document.getElementById('clearFilters');
  const form = document.getElementById('catalogSearchForm');

  list.innerHTML = '<p>Carregando livros...</p>';

  await loadBooks();

  const categories = [...new Set(
    books.map((book) => book.category).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  categorySelect.innerHTML = '<option value="all">Todas as categorias</option>';

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  const params = new URLSearchParams(window.location.search);
  queryInput.value = params.get('q') || '';

  function renderBooks() {
    const query = queryInput.value.trim().toLocaleLowerCase('pt-BR');
    const category = categorySelect.value;
    const availability = availabilitySelect.value;

    const filtered = books.filter((book) => {
      const searchable =
        `${book.title} ${book.author} ${book.category || ''} ${book.description || ''}`
        .toLocaleLowerCase('pt-BR');

      const matchesQuery = !query || searchable.includes(query);
      const matchesCategory = category === 'all' || book.category === category;

      const matchesAvailability =
        availability === 'all' ||
        (availability === 'digital' && book.digitalAvailable) ||
        (availability === 'physical' && !book.digitalAvailable);

      return matchesQuery && matchesCategory && matchesAvailability;
    });

    list.innerHTML = filtered.map(createBookCard).join('');

    resultsCount.innerHTML =
      `<strong>${filtered.length}</strong> ${
        filtered.length === 1 ? 'livro encontrado' : 'livros encontrados'
      }`;

    emptyState.classList.toggle('hidden', filtered.length !== 0);
    list.classList.toggle('hidden', filtered.length === 0);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderBooks();

    const url = new URL(window.location.href);

    if (queryInput.value.trim()) {
      url.searchParams.set('q', queryInput.value.trim());
    } else {
      url.searchParams.delete('q');
    }

    window.history.replaceState({}, '', url);
  });

  categorySelect.addEventListener('change', renderBooks);
  availabilitySelect.addEventListener('change', renderBooks);
  queryInput.addEventListener('input', renderBooks);

  clearButton.addEventListener('click', () => {
    queryInput.value = '';
    categorySelect.value = 'all';
    availabilitySelect.value = 'all';

    window.history.replaceState({}, '', window.location.pathname);
    renderBooks();
  });

  renderBooks();
}


async function setupReaderPage() {
  const titleElement = document.getElementById('readerTitle');
  if (!titleElement) return;

  // Busca os livros no banco de dados
  await loadBooks();

  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('livro');

  // Compara os IDs como texto para evitar incompatibilidade
  const book = books.find((item) => String(item.id) === String(bookId));

  const authorElement = document.getElementById('readerAuthor');
  const categoryElement = document.getElementById('readerCategory');
  const statusElement = document.getElementById('readerStatus');
  const headingElement = document.getElementById('contentHeading');
  const contentElement = document.getElementById('readerContent');
  const shell = document.getElementById('readerShell');
  const notice = document.getElementById('readerNotice');

  // Verifica se o livro existe
  if (!book) {
    shell.innerHTML = `
      <div class="reader-unavailable">
        <h2>Livro não encontrado</h2>
        <p>Não foi possível localizar esta obra no catálogo.</p>
        <a class="button button-primary" href="catalogo.html">
          Voltar ao catálogo
        </a>
      </div>`;
    return;
  }

  titleElement.textContent = book.title;
  document.title = `${book.title} | Leitor digital`;
  authorElement.textContent = `${book.author} · ${book.year || ''}`;
  categoryElement.textContent = book.category || '';
  headingElement.textContent = book.title;

  if (!book.digitalAvailable) {
    notice.classList.add('hidden');

    shell.innerHTML = `
      <div class="reader-unavailable">
        <h2>Esta obra não possui leitura online habilitada</h2>
        <p>Consulte a biblioteca para verificar a disponibilidade.</p>
        <a class="button button-primary" href="catalogo.html">
          Voltar ao catálogo
        </a>
      </div>`;
    return;
  }

  statusElement.textContent = 'Leitura digital';

  if (book.pdfUrl) {
    contentElement.innerHTML = `
      <div class="pdf-container">
        <iframe
          class="pdf-viewer"
          src="${escapeHtml(book.pdfUrl)}"
          title="Leitura em PDF: ${escapeHtml(book.title)}">
        </iframe>

        <img
          class="pdf-watermark"
          src="img/bibliotecaa.png"
          alt=""
          aria-hidden="true">
      </div>
    `;
  } else {
    contentElement.innerHTML = `
      <p>O arquivo digital desta obra ainda não foi cadastrado.</p>
    `;
  }

  const readingPage = document.getElementById('readingPage');
  const increase = document.getElementById('increaseFont');
  const decrease = document.getElementById('decreaseFont');
  const toggleTheme = document.getElementById('toggleTheme');

  let fontSize = 17;

  if (increase) {
    increase.addEventListener('click', () => {
      fontSize = Math.min(fontSize + 1, 24);
      contentElement.style.fontSize = `${fontSize}px`;
    });
  }

  if (decrease) {
    decrease.addEventListener('click', () => {
      fontSize = Math.max(fontSize - 1, 13);
      contentElement.style.fontSize = `${fontSize}px`;
    });
  }

  if (toggleTheme && readingPage) {
    toggleTheme.addEventListener('click', () => {
      const isDark = readingPage.classList.toggle('dark');
      toggleTheme.textContent = isDark ? '☼ Tema claro' : '◐ Tema escuro';
      toggleTheme.setAttribute(
        'aria-label',
        isDark ? 'Ativar tema claro' : 'Ativar tema escuro'
      );
    });
  }
}


async function setupLoanRequestPage() {
  const form = document.getElementById('loanRequestForm');
  if (!form) return;

  const API_LOANS_URL = 'https://biblioteca-md.onrender.com/api/loans';

  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('livro');

  const invalidMessage = document.getElementById('loanInvalidBook');
  const formPanel = document.getElementById('loanFormPanel');
  const successPanel = document.getElementById('loanSuccess');
  const titleInput = document.getElementById('loanBookId');

  // Primeiro carrega os livros do banco de dados.
  await loadBooks();

  // Compara os IDs como texto para evitar erro de tipo.
  const book = books.find(item => String(item.id) === String(bookId));

  if (!book || !book.physicalLoanAvailable) {
    formPanel.classList.add('hidden');
    invalidMessage.classList.remove('hidden');
    return;
  }

  // Preenche os dados do livro.
  titleInput.value = book.id;
  document.getElementById('loanBookTitle').textContent = book.title;
  document.getElementById('loanBookAuthor').textContent =
    `${book.author} · ${book.year}`;
  document.getElementById('loanBookCategory').textContent = book.category;

  document.title = `Solicitar empréstimo | ${book.title}`;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const readerName = document.getElementById('borrowerName').value.trim();
    const phone = document.getElementById('borrowerPhone').value.trim();
    const email = document.getElementById('borrowerEmail').value.trim();

    try {
      const response = await fetch(API_LOANS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookId: Number(book.id),
          readerName: readerName,
          phone: phone,
          email: email || null
        })
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Não foi possível enviar a solicitação.');
      }

      const result = await response.json();

      document.getElementById('loanProtocol').textContent = `BM-${result.id}`;
      document.getElementById('loanSuccessTitle').textContent = book.title;
      document.getElementById('loanStorageNotice').textContent =
        'Sua solicitação foi registrada com sucesso. Aguarde a análise da biblioteca.';

      formPanel.classList.add('hidden');
      successPanel.classList.remove('hidden');

      successPanel.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

    } catch (error) {
      console.error('Erro ao solicitar empréstimo:', error);
      alert(error.message || 'Erro ao enviar solicitação. Tente novamente.');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupHomePage();
  setupCatalogPage();
  setupReaderPage();
  setupLoanRequestPage();
});