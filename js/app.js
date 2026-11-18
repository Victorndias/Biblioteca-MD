
const books = [

  {
  id: 'meu-livro',
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  category: 'Romance',
  year: 1899,
  digitalAvailable: true,
  rightsLabel: 'Acesso digital autorizado',
  coverColor: '#386c85',
  description: 'Romance narrado por Bentinho, marcado por memórias, dúvidas e reflexões.',
  contentHeading: 'Livro Digital',
  content: [],
  pdfUrl: 'pdf/meu-livro.pdf',
  },

  {
    id: 'alienista',
    title: 'O Alienista',
    author: 'Machado de Assis',
    category: 'Literatura brasileira',
    year: 1882,
    digitalAvailable: true,
    rightsLabel: 'Domínio público — exemplo',
    coverColor: '#235946',
    description: 'Uma narrativa clássica que explora os limites entre razão, ciência e sociedade.',
    contentHeading: 'Uma história de Itaguaí',
    content: [
      'Este espaço demonstra como será a experiência de leitura digital da Biblioteca Municipal. O conteúdo mostrado nesta versão é apenas ilustrativo e não substitui a edição integral da obra.',
      'Imagine uma pequena cidade onde as pessoas discutem novidades, compartilham histórias e tentam compreender o mundo ao redor. A biblioteca aproxima leitores dessas narrativas e oferece um lugar para descobrir novas ideias.',
      'Na versão definitiva, o leitor poderá apresentar o arquivo autorizado da obra, com controles de navegação e opções de leitura adequadas ao dispositivo utilizado.'
    ]
  },
  {
    id: 'contos-da-cidade',
    title: 'Contos da nossa cidade',
    author: 'Equipe do projeto',
    category: 'Contos',
    year: 2026,
    digitalAvailable: true,
    rightsLabel: 'Conteúdo demonstrativo próprio',
    coverColor: '#b66e4f',
    description: 'Uma obra fictícia criada para demonstrar o acesso e a leitura online no protótipo.',
    contentHeading: 'A praça e a biblioteca',
    content: [
      'Toda tarde, quando o sol começava a baixar, a praça se enchia de conversas. Perto das árvores havia uma pequena biblioteca, onde cada visitante encontrava uma história diferente.',
      'Joana chegava depois da aula e procurava livros sobre astronomia. Pedro preferia as histórias de aventura. A bibliotecária conhecia os gostos de cada um e sempre tinha uma nova sugestão.',
      'Certo dia, eles perceberam que mais pessoas poderiam descobrir aqueles livros se o catálogo também estivesse disponível pela internet. Assim nasceu a ideia de aproximar a biblioteca de toda a comunidade.'
    ]
  },
  {
    id: 'o-cortico',
    title: 'O Cortiço',
    author: 'Aluísio Azevedo',
    category: 'Literatura brasileira',
    year: 1890,
    digitalAvailable: true,
    rightsLabel: 'Domínio público — exemplo',
    coverColor: '#a34b3f',
    description: 'Romance naturalista que retrata relações sociais e a vida coletiva em um cortiço.',
    contentHeading: 'Sobre a obra',
    content: [
      'Este trecho é apenas demonstrativo e não corresponde ao texto integral do livro. Ele permite testar a exibição de título, autoria, categoria e conteúdo dentro do leitor.',
      'No sistema final, cada obra digital terá seus metadados e sua referência de autorização revisados antes de ser disponibilizada ao público.',
      'O catálogo também deverá distinguir com clareza os livros consultáveis presencialmente daqueles que possuem uma versão digital acessível.'
    ]
  },
  {
    id: 'pequeno-principe',
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    category: 'Ficção',
    year: 1943,
    digitalAvailable: false,
    physicalLoanAvailable: true,
    rightsLabel: 'Disponibilidade digital a confirmar',
    coverColor: '#386c85',
    description: 'Uma narrativa conhecida por suas reflexões sobre amizade, afeto e responsabilidade.',
    contentHeading: 'Leitura indisponível nesta demonstração',
    content: []
  },
  {
    id: 'aventuras-escola',
    title: 'Aventuras para ler na escola',
    author: 'Coleção demonstrativa',
    category: 'Infantojuvenil',
    year: 2024,
    digitalAvailable: false,
    physicalLoanAvailable: true,
    rightsLabel: 'Acervo físico — exemplo',
    coverColor: '#6a6d9a',
    description: 'Título de exemplo para mostrar livros sem leitura digital habilitada.',
    contentHeading: 'Leitura indisponível nesta demonstração',
    content: []
  },
  {
    id: 'poesia-brasileira',
    title: 'Poesia brasileira',
    author: 'Antologia demonstrativa',
    category: 'Poesia',
    year: 2023,
    digitalAvailable: false,
    physicalLoanAvailable: true,
    rightsLabel: 'Acervo físico — exemplo',
    coverColor: '#7c684e',
    description: 'Exemplo de item do catálogo sem versão digital acessível nesta etapa.',
    contentHeading: 'Leitura indisponível nesta demonstração',
    content: []
  },
  {
    id: 'introducao-ciencias',
    title: 'Introdução às Ciências',
    author: 'Coleção de estudos',
    category: 'Estudos',
    year: 2022,
    digitalAvailable: false,
    physicalLoanAvailable: true,
    rightsLabel: 'Acervo físico — exemplo',
    coverColor: '#4a786d',
    description: 'Livro de exemplo para estudantes e para a demonstração dos filtros do catálogo.',
    contentHeading: 'Leitura indisponível nesta demonstração',
    content: []
  }
];

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

function setupHomePage() {
  const featured = document.getElementById('featuredBooks');
  if (featured) {
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

function setupCatalogPage() {
  const list = document.getElementById('catalogBooks');
  if (!list) return;

  const queryInput = document.getElementById('catalogQuery');
  const categorySelect = document.getElementById('categoryFilter');
  const availabilitySelect = document.getElementById('availabilityFilter');
  const resultsCount = document.getElementById('resultsCount');
  const emptyState = document.getElementById('emptyState');
  const clearButton = document.getElementById('clearFilters');
  const form = document.getElementById('catalogSearchForm');

  const categories = [...new Set(books.map((book) => book.category))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
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
      const searchable = `${book.title} ${book.author} ${book.category} ${book.description}`.toLocaleLowerCase('pt-BR');
      const matchesQuery = !query || searchable.includes(query);
      const matchesCategory = category === 'all' || book.category === category;
      const matchesAvailability = availability === 'all'
        || (availability === 'digital' && book.digitalAvailable)
        || (availability === 'physical' && !book.digitalAvailable);
      return matchesQuery && matchesCategory && matchesAvailability;
    });

    list.innerHTML = filtered.map(createBookCard).join('');
    resultsCount.innerHTML = `<strong>${filtered.length}</strong> ${filtered.length === 1 ? 'livro encontrado' : 'livros encontrados'}`;
    emptyState.classList.toggle('hidden', filtered.length !== 0);
    list.classList.toggle('hidden', filtered.length === 0);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderBooks();
    const url = new URL(window.location.href);
    if (queryInput.value.trim()) url.searchParams.set('q', queryInput.value.trim());
    else url.searchParams.delete('q');
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

function setupReaderPage() {
  const titleElement = document.getElementById('readerTitle');
  if (!titleElement) return;

  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('livro');
  const book = books.find((item) => item.id === bookId) || books.find((item) => item.id === 'contos-da-cidade');

  const authorElement = document.getElementById('readerAuthor');
  const categoryElement = document.getElementById('readerCategory');
  const statusElement = document.getElementById('readerStatus');
  const headingElement = document.getElementById('contentHeading');
  const contentElement = document.getElementById('readerContent');
  const shell = document.getElementById('readerShell');
  const notice = document.getElementById('readerNotice');

  titleElement.textContent = book.title;
  document.title = `${book.title} | Leitor digital`;
  authorElement.textContent = `${book.author} · ${book.year}`;
  categoryElement.textContent = book.category;
  statusElement.textContent = book.digitalAvailable ? book.rightsLabel : 'Leitura online indisponível';
  headingElement.textContent = book.contentHeading || book.title;

  if (book.digitalAvailable) {
    contentElement.innerHTML = book.content.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  } else {
    notice.classList.add('hidden');
    shell.innerHTML = `
      <div class="reader-unavailable">
        <h2>Esta obra não possui leitura online habilitada</h2>
        <p>Na versão real, a biblioteca deverá confirmar a autorização digital antes de exibir o conteúdo.</p>
        <a class="button button-primary" href="catalogo.html">Voltar ao catálogo</a>
      </div>`;
    return;
  }

  const readingPage = document.getElementById('readingPage');
  const increase = document.getElementById('increaseFont');
  const decrease = document.getElementById('decreaseFont');
  const toggleTheme = document.getElementById('toggleTheme');
  let fontSize = 17;

  increase.addEventListener('click', () => {
    fontSize = Math.min(fontSize + 1, 24);
    contentElement.style.fontSize = `${fontSize}px`;
  });
  decrease.addEventListener('click', () => {
    fontSize = Math.max(fontSize - 1, 13);
    contentElement.style.fontSize = `${fontSize}px`;
  });
  toggleTheme.addEventListener('click', () => {
    const isDark = readingPage.classList.toggle('dark');
    toggleTheme.textContent = isDark ? '☼ Tema claro' : '◐ Tema escuro';
    toggleTheme.setAttribute('aria-label', isDark ? 'Ativar tema claro' : 'Ativar tema escuro');
  });
}



function setupLoanRequestPage() {
  const form = document.getElementById('loanRequestForm');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('livro');
  const book = books.find((item) => item.id === bookId);
  const bookSummary = document.getElementById('loanBookSummary');
  const invalidMessage = document.getElementById('loanInvalidBook');
  const formPanel = document.getElementById('loanFormPanel');
  const successPanel = document.getElementById('loanSuccess');
  const titleInput = document.getElementById('loanBookId');

  if (!book || book.digitalAvailable || !book.physicalLoanAvailable) {
    formPanel.classList.add('hidden');
    invalidMessage.classList.remove('hidden');
    return;
  }

  titleInput.value = book.id;
  document.getElementById('loanBookTitle').textContent = book.title;
  document.getElementById('loanBookAuthor').textContent = `${book.author} · ${book.year}`;
  document.getElementById('loanBookCategory').textContent = book.category;
  document.getElementById('loanBookCoverTitle').textContent = book.title;
  document.title = `Solicitar empréstimo | ${book.title}`;
  bookSummary.classList.remove('hidden');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    // Apenas simula o resultado visual. Nenhum dado pessoal é salvo ou enviado.
    const protocol = `DEMO-${Date.now().toString().slice(-8)}`;

    document.getElementById('loanProtocol').textContent = protocol;
    document.getElementById('loanSuccessTitle').textContent = book.title;
    document.getElementById('loanStorageNotice').textContent =
      'Este resultado é apenas uma simulação do frontend. Os dados não foram enviados à biblioteca nem armazenados. Para receber solicitações reais, será necessário conectar esta página a um backend.';

    formPanel.classList.add('hidden');
    successPanel.classList.remove('hidden');
    successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupHomePage();
  setupCatalogPage();
  setupReaderPage();
  setupLoanRequestPage();
});