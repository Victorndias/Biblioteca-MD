
package br.com.biblioteca.bibliotecaapi.service;

import br.com.biblioteca.bibliotecaapi.entity.Book;
import br.com.biblioteca.bibliotecaapi.entity.LoanRequest;
import br.com.biblioteca.bibliotecaapi.repository.BookRepository;
import br.com.biblioteca.bibliotecaapi.repository.LoanRequestRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoanRequestService {

    private final LoanRequestRepository loanRepository;
    private final BookRepository bookRepository;

    public LoanRequestService(
            LoanRequestRepository loanRepository,
            BookRepository bookRepository) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
    }

    public List<LoanRequest> findAll() {
        return loanRepository.findAllByOrderByRequestedAtDesc();
    }

    @Transactional
    public LoanRequest create(LoanRequest request) {

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Livro não encontrado"));

        if (!Boolean.TRUE.equals(book.getPhysicalLoanAvailable())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Livro físico indisponível para empréstimo");
        }

        request.setId(null);
        request.setStatus("PENDING");
        request.setRequestedAt(LocalDateTime.now());
        request.setPickupDate(null);
        request.setReturnDate(null);

        return loanRepository.save(request);
    }

    @Transactional
    public LoanRequest updateStatus(Long id, String status) {

        LoanRequest request = loanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Solicitação não encontrada"));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Livro não encontrado"));

        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Status inválido");
        }

        status = status.toUpperCase();

        switch (status) {
            case "APPROVED":
                if (!"PENDING".equals(request.getStatus())) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "Solicitação não está pendente");
                }

                if (!Boolean.TRUE.equals(book.getPhysicalLoanAvailable())) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "Livro indisponível");
                }

                book.setPhysicalLoanAvailable(false);
                bookRepository.save(book);

                request.setPickupDate(LocalDate.now());
                break;

            case "REJECTED":
                if (!"PENDING".equals(request.getStatus())) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "Solicitação não está pendente");
                }
                break;

            case "RETURNED":
                if (!"APPROVED".equals(request.getStatus())) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "Livro não possui empréstimo ativo");
                }

                book.setPhysicalLoanAvailable(true);
                bookRepository.save(book);

                request.setReturnDate(LocalDate.now());
                break;

            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Status inválido");
        }

        request.setStatus(status);

        return loanRepository.save(request);
    }
}