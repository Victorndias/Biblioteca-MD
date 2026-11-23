
package br.com.biblioteca.bibliotecaapi.repository;

import br.com.biblioteca.bibliotecaapi.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
}
