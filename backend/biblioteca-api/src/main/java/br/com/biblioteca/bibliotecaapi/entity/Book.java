
package br.com.biblioteca.bibliotecaapi.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Column(nullable = false)
    private String author;

    private String category;

    @Min(0)
    private Integer year;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Column(nullable = false)
    private Boolean digitalAvailable = false;

    @NotNull
    @Column(nullable = false)
    private Boolean physicalLoanAvailable = false;

    private String type;

    private String pdfUrl;

    public Book() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getDigitalAvailable() { return digitalAvailable; }
    public void setDigitalAvailable(Boolean digitalAvailable) {
        this.digitalAvailable = digitalAvailable;
    }

    public Boolean getPhysicalLoanAvailable() { return physicalLoanAvailable; }
    public void setPhysicalLoanAvailable(Boolean physicalLoanAvailable) {
        this.physicalLoanAvailable = physicalLoanAvailable;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }
}
