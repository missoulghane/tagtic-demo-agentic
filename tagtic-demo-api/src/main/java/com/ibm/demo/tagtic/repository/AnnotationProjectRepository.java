package com.ibm.demo.tagtic.repository;

import com.ibm.demo.tagtic.entity.AnnotationProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AnnotationProjectRepository extends JpaRepository<AnnotationProject, UUID> {
}
