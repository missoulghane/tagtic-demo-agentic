package com.ibm.demo.tagtic.repository;

import com.ibm.demo.tagtic.entity.FormField;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FormFieldRepository extends JpaRepository<FormField, UUID> {

    List<FormField> findByFormIdOrderByOrderIndex(UUID formId);

    long countByFormId(UUID formId);
}
