package com.example.todo_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.todo_backend.domain.AppUser;
import com.example.todo_backend.domain.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
	List<Task> findByUserOrderByIdDesc(AppUser user);
}
