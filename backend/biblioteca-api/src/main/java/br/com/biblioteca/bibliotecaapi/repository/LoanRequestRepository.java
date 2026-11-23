
package br.com.biblioteca.bibliotecaapi.repository;

import br.com.biblioteca.bibliotecaapi.entity.LoanRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRequestRepository extends JpaRepository<LoanRequest, Long> {

    List<LoanRequest> findAllByOrderByRequestedAtDesc();

}