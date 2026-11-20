/* Área do Bibliotecário - protótipo frontend.
   Os dados são fictícios e ficam no localStorage deste navegador. */
(() => {
  const STORAGE_KEY = 'bmd_admin_demo_v1';

  const initialData = {
    books: [
      { id: 'pequeno-principe', title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', category: 'Ficção', year: 1943, type: 'physical', available: true, description: 'Uma narrativa sobre amizade e responsabilidade.' },
      { id: 'aventuras-escola', title: 'Aventuras para ler na escola', author: 'Coleção demonstrativa', category: 'Infantojuvenil', year: 2024, type: 'physical', available: true, description: 'Livro demonstrativo para o catálogo.' },
      { id: 'dom-casmurro', title: 'Dom Casmurro', author: 'Machado de Assis', category: 'Romance', year: 1899, type: 'digital', available: true, description: 'Romance narrado por Bentinho.' },
      { id: 'poesia-brasileira', title: 'Poesia brasileira', author: 'Antologia demonstrativa', category: 'Poesia', year: 2023, type: 'physical', available: false, description: 'Antologia demonstrativa.' }
    ],
    requests: [
      { id: 'REQ-001', reader: 'Leitor demonstrativo 01', phone: '(00) 00000-0000', bookId: 'pequeno-principe', date: '2026-11-17', status: 'pending' },
      { id: 'REQ-002', reader: 'Leitor demonstrativo 02', phone: '(00) 00000-0000', bookId: 'aventuras-escola', date: '2026-11-16', status: 'approved', pickupDate: '2026-11-18' },
      { id: 'REQ-003', reader: 'Leitor demonstrativo 03', phone: '(00) 00000-0000', bookId: 'poesia-brasileira', date: '2026-11-15', status: 'rejected' }
    ],
    returned: []
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : clone(initialData);
    } catch {
      return clone(initialData);
    }
  }
  let data = loadData();
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const $ = (id) => document.getElementById(id);
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
  const bookById = (id) => data.books.find((book) => book.id === id);
  const bookName = (id) => bookById(id)?.title || 'Livro não encontrado';
  const dateBR = (date) => date ? new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR') : '—';
  const statusText = { pending: 'Pendente', approved: 'Aprovada', rejected: 'Recusada', returned: 'Devolvido' };

  function toast(message) {
    const element = $('adminToast');
    element.textContent = message;
    element.classList.remove('hidden');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.add('hidden'), 2800);
  }

  function showView(view) {
    document.querySelectorAll('.admin-view').forEach((section) => section.classList.toggle('hidden', section.id !== `view-${view}`));
    document.querySelectorAll('.admin-tab').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  }

  function renderStats() {
    $('statBooks').textContent = data.books.length;
    $('statPending').textContent = data.requests.filter((item) => item.status === 'pending').length;
    $('statActive').textContent = data.requests.filter((item) => item.status === 'approved').length;
    $('statReturned').textContent = data.returned.length;
  }

  function renderBooks() {
    const query = $('bookSearch').value.trim().toLocaleLowerCase('pt-BR');
    const filtered = data.books.filter((book) => `${book.title} ${book.author}`.toLocaleLowerCase('pt-BR').includes(query));
    $('bookCount').textContent = `${filtered.length} ${filtered.length === 1 ? 'livro' : 'livros'}`;
    $('booksEmpty').classList.toggle('hidden', filtered.length > 0);
    $('booksTable').innerHTML = filtered.map((book) => `
      <tr>
        <td>${safe(book.title)}<br><span class="muted-small">${safe(book.author)} · ${safe(book.year)}</span></td>
        <td>${safe(book.category)}</td>
        <td>${book.type === 'digital' ? 'Digital' : 'Físico'}</td>
        <td><span class="status-tag ${book.available ? 'approved' : 'rejected'}">${book.available ? 'Disponível' : 'Indisponível'}</span></td>
        <td><div class="table-actions"><button data-edit-book="${safe(book.id)}">Editar</button><button class="delete-action" data-delete-book="${safe(book.id)}">Excluir</button></div></td>
      </tr>`).join('');
  }

  function renderRequests() {
    const filter = $('requestFilter').value;
    const list = data.requests.filter((request) => filter === 'all' || request.status === filter);
    $('requestsEmpty').classList.toggle('hidden', list.length > 0);
    $('requestsTable').innerHTML = list.map((request) => `
      <tr>
        <td>${safe(request.reader)}<br><span class="muted-small">${safe(request.phone)}</span></td>
        <td>${safe(bookName(request.bookId))}</td>
        <td>${dateBR(request.date)}</td>
        <td><span class="status-tag ${request.status}">${statusText[request.status]}</span></td>
        <td>${request.status === 'pending' ? `<div class="table-actions"><button data-approve="${safe(request.id)}">Aprovar</button><button class="delete-action" data-reject="${safe(request.id)}">Recusar</button></div>` : '—'}</td>
      </tr>`).join('');
  }

  function renderReturns() {
    const active = data.requests.filter((request) => request.status === 'approved');
    $('returnsEmpty').classList.toggle('hidden', active.length > 0);
    $('returnsTable').innerHTML = active.map((request) => `
      <tr>
        <td>${safe(request.reader)}</td><td>${safe(bookName(request.bookId))}</td>
        <td>${dateBR(request.pickupDate)}</td>
        <td><span class="status-tag approved">Em empréstimo</span></td>
        <td><button class="text-button" data-return="${safe(request.id)}">Registrar devolução</button></td>
      </tr>`).join('');
    $('returnedList').innerHTML = data.returned.length
      ? data.returned.slice().reverse().slice(0, 6).map((item) => `<div class="returned-item"><span>${safe(item.bookTitle)} — ${safe(item.reader)}</span><strong>${dateBR(item.returnDate)}</strong></div>`).join('')
      : '<p class="muted-small">Nenhuma devolução registrada neste protótipo.</p>';
  }

  function renderAll() {
    renderStats();
    renderBooks();
    renderRequests();
    renderReturns();
  }

  function resetBookForm() {
    $('bookForm').reset();
    $('editBookId').value = '';
    $('bookFormTitle').textContent = 'Novo livro';
    $('bookAvailability').value = 'available';
    $('bookForm').classList.add('hidden');
  }

  function editBook(id) {
    const book = bookById(id);
    if (!book) return;
    $('editBookId').value = book.id;
    $('bookTitle').value = book.title;
    $('bookAuthor').value = book.author;
    $('bookCategory').value = book.category;
    $('bookYear').value = book.year;
    $('bookType').value = book.type;
    $('bookAvailability').value = book.available ? 'available' : 'unavailable';
    $('bookDescription').value = book.description || '';
    $('bookFormTitle').textContent = 'Editar livro';
    $('bookForm').classList.remove('hidden');
    $('bookForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.querySelectorAll('.admin-tab').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
  document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.go)));
  $('showBookForm').addEventListener('click', () => {
    resetBookForm();
    $('bookForm').classList.remove('hidden');
    $('bookForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('bookTitle').focus();
  });
  $('cancelBookForm').addEventListener('click', resetBookForm);
  $('bookSearch').addEventListener('input', renderBooks);
  $('requestFilter').addEventListener('change', renderRequests);

  $('bookForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const id = $('editBookId').value || `livro-${Date.now()}`;
    const existing = bookById(id);
    const book = {
      id,
      title: $('bookTitle').value.trim(),
      author: $('bookAuthor').value.trim(),
      category: $('bookCategory').value.trim(),
      year: Number($('bookYear').value),
      type: $('bookType').value,
      available: $('bookAvailability').value === 'available',
      description: $('bookDescription').value.trim()
    };
    if (existing) Object.assign(existing, book);
    else data.books.push(book);
    save();
    resetBookForm();
    renderAll();
    toast(existing ? 'Livro atualizado no protótipo.' : 'Livro cadastrado no protótipo.');
  });

  $('booksTable').addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-book]');
    const deleteButton = event.target.closest('[data-delete-book]');
    if (editButton) editBook(editButton.dataset.editBook);
    if (deleteButton) {
      const id = deleteButton.dataset.deleteBook;
      if (!confirm('Deseja excluir este livro dos dados demonstrativos?')) return;
      data.books = data.books.filter((book) => book.id !== id);
      save(); renderAll(); toast('Livro removido do protótipo.');
    }
  });

  $('requestsTable').addEventListener('click', (event) => {
    const approve = event.target.closest('[data-approve]');
    const reject = event.target.closest('[data-reject]');
    if (approve) {
      const request = data.requests.find((item) => item.id === approve.dataset.approve);
      if (request) {
        request.status = 'approved';
        request.pickupDate = new Date().toISOString().slice(0, 10);
        save(); renderAll(); toast('Solicitação aprovada no protótipo.');
      }
    }
    if (reject) {
      const request = data.requests.find((item) => item.id === reject.dataset.reject);
      if (request && confirm('Deseja recusar esta solicitação demonstrativa?')) {
        request.status = 'rejected';
        save(); renderAll(); toast('Solicitação recusada no protótipo.');
      }
    }
  });

  $('returnsTable').addEventListener('click', (event) => {
    const button = event.target.closest('[data-return]');
    if (!button) return;
    const index = data.requests.findIndex((item) => item.id === button.dataset.return);
    if (index < 0) return;
    const [request] = data.requests.splice(index, 1);
    data.returned.push({
      id: request.id,
      reader: request.reader,
      bookTitle: bookName(request.bookId),
      returnDate: new Date().toISOString().slice(0, 10)
    });
    save(); renderAll(); toast('Devolução registrada no protótipo.');
  });

  $('resetDemo').addEventListener('click', () => {
    if (!confirm('Restaurar os livros e as solicitações demonstrativas? Suas alterações locais serão perdidas.')) return;
    data = clone(initialData);
    save(); resetBookForm(); renderAll(); showView('overview');
    toast('Dados demonstrativos restaurados.');
  });

  if (!localStorage.getItem(STORAGE_KEY)) save();
  renderAll();
})();
