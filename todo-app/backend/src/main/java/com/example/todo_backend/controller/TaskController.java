package com.example.todo_backend.controller;

import com.example.todo_backend.domain.Task;
import com.example.todo_backend.repository.TaskRepository;
import com.example.todo_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Task> getTasks(@AuthenticationPrincipal UserDetails userDetails) {
        var user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return taskRepository.findByUserOrderByIdDesc(user);
    }

    @PostMapping
    public ResponseEntity<?> createTask(
            @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        var user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        var task = new Task();
        task.setTitle(request.title());
        task.setDetail(request.detail());
        if (request.dueDate() != null && !request.dueDate().isBlank()) {
            task.setDueDate(LocalDate.parse(request.dueDate()));
        }
        task.setCategory(request.category());
        task.setCreatedAt(LocalDate.now());
        task.setUser(user);
        taskRepository.save(task);

        return ResponseEntity.ok(task);
    }

    @Transactional
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleDone(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        var user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        var task = taskRepository.findById(id).orElse(null);
        if (task == null || !task.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        task.setDone(!task.isDone());
        taskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        var user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        var task = taskRepository.findById(id).orElse(null);
        if (task == null || !task.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        task.setTitle(request.title());
        task.setDetail(request.detail());
        task.setDueDate(request.dueDate() != null && !request.dueDate().isBlank()
                ? LocalDate.parse(request.dueDate()) : null);
        task.setCategory(request.category());
        taskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        var user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        var task = taskRepository.findById(id).orElse(null);
        if (task == null || !task.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        taskRepository.delete(task);
        return ResponseEntity.noContent().build();
    }

    public record TaskRequest(String title, String detail, String dueDate, String category) {}
}
