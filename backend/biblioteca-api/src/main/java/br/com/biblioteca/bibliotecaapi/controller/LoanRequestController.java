
package br.com.biblioteca.bibliotecaapi.controller;

import br.com.biblioteca.bibliotecaapi.entity.LoanRequest;
import br.com.biblioteca.bibliotecaapi.service.LoanRequestService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanRequestController {

    private final LoanRequestService loanService;

    public LoanRequestController(LoanRequestService loanService) {
        this.loanService = loanService;
    }

    @GetMapping
    public List<LoanRequest> findAll() {
        return loanService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LoanRequest create(@Valid @RequestBody LoanRequest request) {
        return loanService.create(request);
    }

    @PatchMapping("/{id}/status")
    public LoanRequest updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        return loanService.updateStatus(id, body.get("status"));
    }
}