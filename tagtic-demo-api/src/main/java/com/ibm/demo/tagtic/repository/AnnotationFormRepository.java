package com.ibm.demo.tagtic.repository;

import com.ibm.demo.tagtic.entity.AnnotationForm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AnnotationFormRepository extends JpaRepository<AnnotationForm, UUID> {

    Optional<AnnotationForm> findByProjectId(UUID projectId);

    boolean existsByProjectId(UUID projectId);
}
