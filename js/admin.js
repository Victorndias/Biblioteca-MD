
(() => {
  const API_URL = 'http://localhost:8080/api/books';
  const API_LOANS_URL = 'http://localhost:8080/api/loans';

  let books = [];
  let requests = [];

  const $ = (id) => document.getElementById(id);

  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);

  function toast(message) {
    const element = $('adminToast');
    element.textContent = message;
    element.classList.remove('hidden');

    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      element.classList.add('hidden');
    }, 2800);
  }

  async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Erro HTTP ${response.status}`);
    }

    if (response.status === 204) return null;

    return response.json();
  }

  async function loadAll() {
    const [bookData, loanData] = await Promise.all([
      apiRequest(API_URL),
      apiRequest(API_LOANS_URL)
    ]);

    books = bookData;
    requests = loanData.map(request => ({
      ...request,
      status: String(request.status || '').toLowerCase()
    }));

    renderAll();
  }

  function bookById(id) {
    return books.find(book => String(book.id) === String(id));
  }

  function bookName(id) {
    return bookById(id)?.title || 'Livro não encontrado';
  }

  function dateBR(value) {
    if (!value) return '—';

    const date = String(value).slice(0, 10);
    const [year, month, day] = date.split('-');

    if (!year || !month || !day) return '—';

    return `${day}/${month}/${year}`;
  }

  const statusText = {
    pending: 'Pendente',
    approved: 'Aprovada',
    rejected: 'Recusada',
    returned: 'Devolvido'
  };

  function showView(view) {
    document.querySelectorAll('.admin-view').forEach(section => {
      section.classList.toggle('hidden', section.id !== `view-${view}`);
    });

    document.querySelectorAll('.admin-tab').forEach(button => {
      button.classList.toggle('active', button.dataset.view === view);
    });
  }

  function renderStats() {
    $('statBooks').textContent = books.length;

    $('statPending').textContent =
      requests.filter(item => item.status === 'pending').length;

    $('statActive').textContent =
      requests.filter(item => item.status === 'approved').length;

    $('statReturned').textContent =
      requests.filter(item => item.status === 'returned').length;
  }

  function renderBooks() {
    const query = $('bookSearch').value.trim().toLocaleLowerCase('pt-BR');

    const filtered = books.filter(book =>
      `${book.title} ${book.author}`
        .toLocaleLowerCase('pt-BR')
        .includes(query)
    );

    $('bookCount').textContent =
      `${filtered.length} ${filtered.length === 1 ? 'livro' : 'livros'}`;

    $('booksEmpty').classList.toggle('hidden', filtered.length > 0);

    $('booksTable').innerHTML = filtered.map(book => {
      const type = book.type ||
        (book.digitalAvailable ? 'digital' : 'physical');

      const available = type === 'digital'
        ? book.digitalAvailable
        : book.physicalLoanAvailable;

      return `
        <tr>
          <td>
            ${safe(book.title)}
            <br>
            <span class="muted-small">
              ${safe(book.author)} · ${safe(book.year)}
            </span>
          </td>

          <td>${safe(book.category)}</td>

          <td>${type === 'digital' ? 'Digital' : 'Físico'}</td>

          <td>
            <span class="status-tag ${available ? 'approved' : 'rejected'}">
              ${available ? 'Disponível' : 'Indisponível'}
            </span>
          </td>

          <td>
            <div class="table-actions">
              <button data-edit-book="${book.id}">Editar</button>
              <button class="delete-action" data-delete-book="${book.id}">
                Excluir
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderRequests() {
    const filter = $('requestFilter').value;

    const list = requests.filter(request =>
      filter === 'all' || request.status === filter
    );

    $('requestsEmpty').classList.toggle('hidden', list.length > 0);

    $('requestsTable').innerHTML = list.map(request => {
      let actions = '—';

      if (request.status === 'pending') {
        actions = `
          <div class="table-actions">
            <button data-approve-loan="${request.id}">Aprovar</button>
            <button class="delete-action" data-reject-loan="${request.id}">
              Recusar
            </button>
          </div>
        `;
      }

      return `
        <tr>
          <td>
            ${safe(request.readerName)}
            <br>
            <span class="muted-small">${safe(request.phone)}</span>
            ${request.email ? `<br><span class="muted-small">${safe(request.email)}</span>` : ''}
          </td>

          <td>${safe(bookName(request.bookId))}</td>

          <td>${dateBR(request.requestedAt)}</td>

          <td>
            <span class="status-tag ${safe(request.status)}">
              ${statusText[request.status] || safe(request.status)}
            </span>
          </td>

          <td>${actions}</td>
        </tr>
      `;
    }).join('');
  }

  function renderReturns() {
    const active = requests.filter(request =>
      request.status === 'approved'
    );

    $('returnsEmpty').classList.toggle('hidden', active.length > 0);

    $('returnsTable').innerHTML = active.map(request => `
      <tr>
        <td>${safe(request.readerName)}</td>

        <td>${safe(bookName(request.bookId))}</td>

        <td>${dateBR(request.pickupDate)}</td>

        <td>
          <span class="status-tag approved">Em empréstimo</span>
        </td>

        <td>
          <button data-return-loan="${request.id}">
            Registrar devolução
          </button>
        </td>
      </tr>
    `).join('');

    const returned = requests
      .filter(request => request.status === 'returned')
      .sort((a, b) =>
        String(b.returnDate || '').localeCompare(String(a.returnDate || ''))
      );

    $('returnedList').innerHTML = returned.length
      ? returned.slice(0, 6).map(item => `
          <div class="returned-item">
            <span>
              ${safe(bookName(item.bookId))} — ${safe(item.readerName)}
            </span>
            <strong>${dateBR(item.returnDate)}</strong>
          </div>
        `).join('')
      : '<p class="muted-small">Nenhuma devolução registrada.</p>';
  }

  function renderAll() {
    renderStats();
    renderBooks();
    renderRequests();
    renderReturns();
  }

  async function updateLoanStatus(id, status) {
    try {
      await apiRequest(`${API_LOANS_URL}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });

      await loadAll();

      const messages = {
        APPROVED: 'Empréstimo aprovado!',
        REJECTED: 'Solicitação recusada.',
        RETURNED: 'Devolução registrada com sucesso!'
      };

      toast(messages[status]);

    } catch (error) {
      console.error('Erro ao atualizar empréstimo:', error);
      toast(error.message || 'Não foi possível atualizar a solicitação.');
    }
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

    const type = book.type ||
      (book.digitalAvailable ? 'digital' : 'physical');

    const available = type === 'digital'
      ? book.digitalAvailable
      : book.physicalLoanAvailable;

    $('editBookId').value = book.id;
    $('bookTitle').value = book.title || '';
    $('bookAuthor').value = book.author || '';
    $('bookCategory').value = book.category || '';
    $('bookYear').value = book.year || '';
    $('bookType').value = type;
    $('bookAvailability').value = available ? 'available' : 'unavailable';
    $('bookDescription').value = book.description || '';
    $('bookPdfUrl').value = book.pdfUrl || '';

    $('bookFormTitle').textContent = 'Editar livro';
    $('bookForm').classList.remove('hidden');

    $('bookForm').scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  // Navegação
  document.querySelectorAll('.admin-tab').forEach(button => {
    button.addEventListener('click', () => showView(button.dataset.view));
  });

  document.querySelectorAll('[data-go]').forEach(button => {
    button.addEventListener('click', () => showView(button.dataset.go));
  });

  // Formulário de livros
  $('showBookForm').addEventListener('click', () => {
    resetBookForm();

    $('bookForm').classList.remove('hidden');

    $('bookForm').scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    $('bookTitle').focus();
  });

  $('cancelBookForm').addEventListener('click', resetBookForm);

  $('bookSearch').addEventListener('input', renderBooks);

  $('requestFilter').addEventListener('change', renderRequests);

  // Cadastro e edição de livros
  $('bookForm').addEventListener('submit', async event => {
    event.preventDefault();

    const id = $('editBookId').value;
    const type = $('bookType').value;
    const available = $('bookAvailability').value === 'available';

    const book = {
      title: $('bookTitle').value.trim(),
      author: $('bookAuthor').value.trim(),
      category: $('bookCategory').value.trim(),
      year: Number($('bookYear').value),
      type: type,
      description: $('bookDescription').value.trim(),
      digitalAvailable: type === 'digital' && available,
      physicalLoanAvailable: type === 'physical' && available,
      pdfUrl: $('bookPdfUrl').value.trim()
    };

    try {
      if (id) {
        await apiRequest(`${API_URL}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(book)
        });

        toast('Livro atualizado com sucesso!');
      } else {
        await apiRequest(API_URL, {
          method: 'POST',
          body: JSON.stringify(book)
        });

        toast('Livro cadastrado com sucesso!');
      }

      resetBookForm();
      await loadAll();

    } catch (error) {
      console.error(error);
      toast('Erro ao salvar livro. Verifique o backend.');
    }
  });

  // Edição e exclusão de livros
  $('booksTable').addEventListener('click', async event => {
    const editButton = event.target.closest('[data-edit-book]');
    const deleteButton = event.target.closest('[data-delete-book]');

    if (editButton) {
      editBook(editButton.dataset.editBook);
    }

    if (deleteButton) {
      const id = deleteButton.dataset.deleteBook;

      if (!confirm('Deseja realmente excluir este livro do banco de dados?')) {
        return;
      }

      try {
        await apiRequest(`${API_URL}/${id}`, {
          method: 'DELETE'
        });

        await loadAll();
        toast('Livro excluído com sucesso!');

      } catch (error) {
        console.error(error);
        toast('Erro ao excluir livro.');
      }
    }
  });

  // Aprovar ou recusar solicitações
  $('requestsTable').addEventListener('click', async event => {
    const approveButton = event.target.closest('[data-approve-loan]');
    const rejectButton = event.target.closest('[data-reject-loan]');

    if (approveButton) {
      await updateLoanStatus(
        approveButton.dataset.approveLoan,
        'APPROVED'
      );
    }

    if (rejectButton) {
      if (!confirm('Deseja realmente recusar esta solicitação?')) return;

      await updateLoanStatus(
        rejectButton.dataset.rejectLoan,
        'REJECTED'
      );
    }
  });

  // Registrar devolução
  $('returnsTable').addEventListener('click', async event => {
    const returnButton = event.target.closest('[data-return-loan]');

    if (!returnButton) return;

    if (!confirm('Confirmar a devolução deste livro?')) return;

    await updateLoanStatus(
      returnButton.dataset.returnLoan,
      'RETURNED'
    );
  });

  // Remove botão de demonstração, se ainda existir
  const resetDemoButton = $('resetDemo');

  if (resetDemoButton) {
    resetDemoButton.remove();
  }

  // Inicialização
  loadAll().catch(error => {
    console.error('Erro ao carregar dados:', error);
    toast('Não foi possível carregar os dados. Verifique o backend.');
  });

})();